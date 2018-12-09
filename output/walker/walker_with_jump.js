define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function walk(ast, handler) {
        for (var i = 0; i < ast.length; i++) {
            var element = ast[i];
            var workThrough = handler(element);
            if (workThrough !== false) {
                walkThroughAstTree(element, handler);
            }
        }
    }
    exports.walk = walk;
    function walkThroughAstTree(ast, handler) {
        switch (ast.type) {
            case 'unary':
                var workThrough = handler(ast.expression);
                if (workThrough !== false) {
                    walkThroughAstTree(ast.expression, handler);
                }
                break;
            case 'if':
                workThrough = handler(ast.expression);
                if (workThrough !== false) {
                    walkThroughAstTree(ast.expression, handler);
                }
                break;
            case 'binary':
                workThrough = handler(ast.left);
                if (workThrough !== false) {
                    walkThroughAstTree(ast.left, handler);
                }
                workThrough = handler(ast.right);
                if (workThrough !== false) {
                    walkThroughAstTree(ast.right, handler);
                }
                break;
            case 'call':
                walk(ast.params, handler);
                break;
            case 'identifier':
            case 'comment':
            case 'else':
            case 'endif':
            case 'endfor':
            case 'value':
            case 'jump':
            case 'label':
                break;
            default:
                throw new Error('unknow token type');
        }
    }
    exports.walkThroughAstTree = walkThroughAstTree;
});
