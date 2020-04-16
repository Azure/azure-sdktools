# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
from __future__ import print_function

import os
import markdown2
import bs4
import re
from .warden_common import check_match, walk_directory_for_pattern, get_omitted_files
from .HeaderConstruct import HeaderConstruct
from docutils import core
from docutils.writers.html4css1 import Writer,HTMLTranslator
import logging

import pdb

README_PATTERNS = ['*/readme.md', '*/readme.rst', '*/README.md', '*/README.rst']

# entry point
def verify_readme_content(config):
    all_readmes = walk_directory_for_pattern(config.target_directory, README_PATTERNS, config)
    omitted_readmes = get_omitted_files(config)
    targeted_readmes = [readme for readme in all_readmes if readme not in omitted_readmes]
    known_issue_paths = config.get_known_content_issues()
    section_sorting_dict = config.required_readme_sections

    ignored_missing_readme_paths = []
    readme_results = []
    readmes_with_issues = []

    for readme in targeted_readmes:
        ext = os.path.splitext(readme)[1]
        if ext == '.rst':
            readme_results.append(verify_rst_readme(readme, config, section_sorting_dict))
        else:
            readme_results.append(verify_md_readme(readme, config, section_sorting_dict))

    for readme_tuple in readme_results:
        if readme_tuple[1]:
            if readme_tuple[0] in known_issue_paths:
                ignored_missing_readme_paths.append(readme_tuple)
            else:
                readmes_with_issues.append(readme_tuple)

    return readmes_with_issues, ignored_missing_readme_paths

# parse rst to html, check for presence of appropriate sections
def verify_rst_readme(readme, config, section_sorting_dict):
    with open(readme, 'r', encoding="utf-8") as f:
        readme_content = f.read()
    html_readme_content = rst_to_html(readme_content)
    html_soup = bs4.BeautifulSoup(html_readme_content, "html.parser")

    missed_patterns = find_missed_sections(html_soup, config.required_readme_sections)

    return (readme, missed_patterns)

# parse md to html, check for presence of appropriate sections
def verify_md_readme(readme, config, section_sorting_dict):
    if config.verbose_output:
        print('Examining content in {}'.format(readme))

    with open(readme, 'r', encoding="utf-8") as f:
        readme_content = f.read()
    html_readme_content = markdown2.markdown(readme_content)
    html_soup = bs4.BeautifulSoup(html_readme_content, "html.parser")

    missed_patterns = find_missed_sections(html_soup, config.required_readme_sections)

    return (readme, missed_patterns)

# within the entire readme, are there any missing sections that are expected?
def find_missed_sections(html_soup, patterns):
    header_list = html_soup.find_all(re.compile('^h[1-4]$'))

    flattened_patterns = flatten(patterns)
    header_web, node_index = generate_web(header_list, flattened_patterns)
    observed_failing_patterns = recursive_header_search(node_index, patterns, [])

    return observed_failing_patterns

def flatten(patterns):
    observed_patterns = []

    for pattern in patterns:
        if isinstance(pattern, dict):
            parent_pattern, child_patterns =  next(iter(pattern.items()))

            if child_patterns:
                observed_patterns.extend(flatten(child_patterns))
            observed_patterns.extend([parent_pattern])
        else:
            observed_patterns.extend([pattern])

    return list(set(observed_patterns))

# recursive solution that walks all the rules and generates rule chains from them to test 
# that the tree actually contains sets of headers that meet the required sections
def recursive_header_search(node_index, patterns, parent_chain=[]):
    unobserved_patterns = []

    if patterns:
        for pattern in patterns:
            if isinstance(pattern, dict):
                parent_pattern, child_patterns =  next(iter(pattern.items()))

                if not match_regex_to_headers(node_index, parent_chain + [parent_pattern]):
                    unobserved_patterns.append(parent_chain + [parent_pattern])

                parent_chain_for_children = parent_chain + [parent_pattern]
                unobserved_patterns.extend(recursive_header_search(node_index, child_patterns, parent_chain_for_children))
            else:
                if not match_regex_to_headers(node_index, parent_chain + [pattern]):
                    unobserved_patterns.append((parent_chain + [pattern]))

    return unobserved_patterns

# a set of headers looks like this
# h1
# h2
# h1
# h2
# h3
# h1
# any "indented" headers are children of the one above it IF the
# one above it is at a higher header level (this is actually < in comparison)
# result of above should be a web that looks like
# root
#   h1
#      h2
#   h1
#      h2
#         h3
#   h1
# we will start a search from root every time.
def generate_web(headers, patterns):
    previous_header_level = 0
    current_header = None
    root = HeaderConstruct(None, None)
    current_parent = root
    node_index = []
    num_run = 0
    previous_node_level = 0

    for index, header in enumerate(headers):
        # evaluate the level
        current_level = int(header.name.replace('h', ''))

        # h1 < h2 == we need to traverse up
        if current_level < current_parent.level:
            current_parent = current_parent.parent
            current_header = HeaderConstruct(header, current_parent, patterns)
            current_parent.add_child(current_header)

        # h2 > h1 == we need to indent, add the current as a child, and set parent to current
        # for the forthcoming ones headers
        elif current_level > current_parent.level:
            current_header = HeaderConstruct(header, current_parent, patterns)
            current_parent.add_child(current_header)

            # only set current_parent if there are children below, which NECESSITATES that 
            # the very next header must A) exist and B) be > current_level
            if index + 1 < len(headers):
                if int(headers[index+1].name.replace('h', '')) > current_level:
                    current_parent = current_header

        # current_header.level == current_parent.level
        # we just need to add it as a child to our current header
        else: 
            if previous_node_level > current_parent.level:
                current_parent = current_parent.parent

            current_header = HeaderConstruct(header, current_parent, patterns)
            current_parent.add_child(current_header)

        previous_node_level = current_level

        # always add the header to the node index, we will use it later
        node_index.append(current_header)
        num_run = num_run + 1

    return root, node_index

# checks multiple header strings against a single configured pattern set
def match_regex_to_headers(node_index, target_patterns):
    # we should only be firing this for a "leaf" aka the END of the chain we're looking for, so the last element
    # will always get popped first before we recurse across the rest

    current_target = target_patterns.pop()
    matching_headers = [header for header in node_index if current_target in header.matching_patterns]

    # check all the leaf node parents for the matches. we don't want to artificially constrain though
    # so we have to assume that a rule can match multiple children
    for matching_leaf_header in matching_headers:
        if target_patterns:
            result = check_header_parents(matching_leaf_header, target_patterns[:])
        else:
            return re.search(current_target, matching_leaf_header.get_tag_text())

        if result:
            return matching_leaf_header
        else:
            continue

    return None

def check_header_parents(header_construct, required_parent_headers):
    if required_parent_headers:
        target_parent = required_parent_headers.pop()

        new_parent = header_construct.check_parents_for_pattern(target_parent)

        if new_parent:
            if required_parent_headers:
                check_header_parents(header_construct, required_parent_headers)
            else:
                return True
        else:
            return False
    else:
        return False



# checks a header string against a set of configured patterns
def match_regex_set(header, patterns):
    matching_patterns = []
    for pattern in patterns:
        result = re.search(pattern, header)
        if result:
            matching_patterns.append(pattern)
            break

    return matching_patterns

# boilerplate for translating RST
class HTMLFragmentTranslator(HTMLTranslator):
    def __init__(self, document):
        HTMLTranslator.__init__(self, document)
        self.head_prefix = ['','','','','']
        self.body_prefix = []
        self.body_suffix = []
        self.stylesheet = []
    def astext(self):
        return ''.join(self.body)

html_fragment_writer = Writer()
html_fragment_writer.translator_class = HTMLFragmentTranslator

# utilize boilerplate
def rst_to_html(input_rst):
    return core.publish_string(input_rst, writer = html_fragment_writer)
