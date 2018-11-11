import { Ast } from "../parser/parser_with_jump";

export function walk(ast: Ast[], handler: (node: Ast) => false | void) {
    for (let i = 0; i < ast.length; i++) {
        const element = ast[i];
        const workThrough = handler(element);
        if (workThrough !== false) {
            walkThroughAstTree(element, handler);
        }
    }
}

export function walkThroughAstTree(ast: Ast, handler: (node: Ast) => false | void) {
    switch (ast.type) {
        case 'unary':
            let workThrough = handler(ast.expression);
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