package com.azure.tools.apiview.processor.analysers.util;

import com.azure.tools.apiview.processor.model.APIListing;
import com.azure.tools.apiview.processor.model.Token;
import com.azure.tools.apiview.processor.model.TreeNode;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class APIListingValidator {
    private APIListingValidator() { }

    public static void validate(APIListing apiListing) {
        // Create a set to store the IDs
        Set<String> ids = new HashSet<>();

        // Recursively ensure that all tokens in the entire API listing have a kind, and a unique ID (except for those with no ID).
        apiListing.getApiForest().forEach(node -> validateTreeNode(node, ids));
    }

    private static void validateTreeNode(TreeNode node, Set<String> ids) {
        validateTokenList(node.getTopTokens(), ids);
        validateTokenList(node.getBottomTokens(), ids);
        node.getChildren().forEach(childNode -> validateTreeNode(childNode, ids));

        // Validate TreeNode ID
        String id = node.getId();
        if (id == null) {
            throw new IllegalStateException("TreeNode ID cannot be null for node: " + node);
        }
        validateId(id, ids);
    }

    private static void validateTokenList(List<Token> tokens, Set<String> ids) {
        for (Token token : tokens) {
            validateToken(token, ids);
        }
    }

    private static void validateToken(Token token, Set<String> ids) {
        if (token.getKind() == null) {
            throw new IllegalStateException("Token kind cannot be null");
        }

        String id = token.getId();
        if (id != null) {
            // Check if the ID is unique
            validateId(id, ids);
        }
    }

    private static void validateId(String id, Set<String> ids) {
        if (ids.contains(id)) {
            throw new IllegalStateException("ID is not unique: \"" + id + "\"");
        } else {
            ids.add(id);
        }
    }
}