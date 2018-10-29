import { Ast } from "../parser/parser";
import { Pos } from "../parser/tokenizer";

export function forEachChild(ast: Ast, visitor: (ast: Ast, parent: Ast) => any): any {
    switch (ast.type) {
        case 'block':
            for (let i = 0; i < ast.children.length; i++) {
                const element = ast.children[i];
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

export function findNodeByPos(ast: Ast, pos: Pos) {
    let targetNode = ast;
    function marker(child: Ast, parent: Ast) {
        if (child.start.offset > pos.offset || child.end.offset <= pos.offset) {
            return;
        }
        targetNode = child;
        forEachChild(child, marker);
    }
    forEachChild(ast, marker);
    return targetNode;
}
