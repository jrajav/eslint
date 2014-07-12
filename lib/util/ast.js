/**
 * @fileoverview AST utilities.
 * @author Jonathan Rajavuori
 * @copyright 2014 Jonathan Rajavuori. All rights reserved.
 */

"use strict";

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Gets all comments for the given node.
 * @param {ASTNode} node The AST node to get the comments for.
 * @returns {Object} The list of comments indexed by their position.
 */
exports.getComments = function(node) {

    var leadingComments = node.leadingComments || [],
        trailingComments = node.trailingComments || [];

    /*
     * Esprima adds a "comments" array on Program nodes rather than
     * leadingComments/trailingComments.
     */
    if (node.type === "Program" && node.body.length === 0) {
        leadingComments = node.comments;
    }

    return {
        leading: leadingComments,
        trailing: trailingComments
    };
};

/**
 * Retrieves the JSDoc comment for the given node.
 * @param {ASTNode} node The AST node to get the comment for.
 * @returns {ASTNode} The BlockComment node containing the JSDoc for the
 *      given node or null if not found.
 */
exports.getJSDocComment = function(node) {

    var parent = node.parent,
        line = node.loc.start.line;

    /**
     * Finds a JSDoc comment node in an array of comment nodes.
     * @param {ASTNode[]} comments The array of comment nodes to search.
     * @returns {ASTNode} The node if found, null if not.
     * @private
     */
    function findJSDocComment(comments) {

        if (comments) {
            for (var i = comments.length - 1; i >= 0; i--) {
                if (comments[i].type === "Block" && comments[i].value.charAt(0) === "*") {

                    if (line - comments[i].loc.end.line <= 1) {
                        return comments[i];
                    } else {
                        break;
                    }
                }
            }
        }

        return null;
    }

    switch (node.type) {
        case "FunctionDeclaration":
            return findJSDocComment(node.leadingComments);

        case "FunctionExpression":

            if (parent.type !== "CallExpression" || parent.callee !== node) {
                while (parent && !parent.leadingComments && parent.type !== "FunctionExpression" && parent.type !== "FunctionDeclaration") {
                    parent = parent.parent;
                }

                return parent && (parent.type !== "FunctionDeclaration") ? findJSDocComment(parent.leadingComments) : null;
            }

            // falls through

        default:
            return null;
    }
};
