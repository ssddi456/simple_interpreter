define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function forEachChild(ast, visitor) {
        switch (ast.type) {
            case 'block':
                for (var i = 0; i < ast.children.length; i++) {
                    var element = ast.children[i];
                    visitor(element, ast);
                }
                break;
            case 'binary':
                visitor(ast.left, ast);
                visitor(ast.right, ast);
                break;
            case 'if':
                visitor(ast.expression, ast);
                visitor(ast.do, ast);
                if (ast.else) {
                    visitor(ast.else, ast);
                }
                break;
            case 'trinary':
                visitor(ast.expression, ast);
                visitor(ast.do, ast);
                visitor(ast.else, ast);
                break;
        }
    }
    exports.forEachChild = forEachChild;
    function findNodeByPos(ast, pos) {
        var targetNode = ast;
        function marker(child, parent) {
            if (child.start.offset > pos.offset || child.end.offset <= pos.offset) {
                return;
            }
            targetNode = child;
            forEachChild(child, marker);
        }
        forEachChild(ast, marker);
        return targetNode;
    }
    exports.findNodeByPos = findNodeByPos;
});
