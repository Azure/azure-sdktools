import re

class HeaderConstruct():
    def __init__(self, tag, parent, patterns = []):
        self.tag = tag
        self.parent = parent
        self.level = 0
        self.matching_patterns = []

        if tag:
            self.level = int(tag.name.replace('h', ''))

        for pattern in patterns[:]:
            if re.search(pattern, self.tag.get_text()):
                self.matching_patterns.append(pattern)

    def __str__(self):
      return self.tag.get_text()

    def get_tag_text(self):
        return str(self)

    def check_parents_for_pattern(self, pattern):
        current_parent = self.parent

        while current_parent:
            result = re.search(pattern, current_parent.get_tag_text())

            if result:
                return current_parent
            else:
                current_parent = current_parent.parent

        return None