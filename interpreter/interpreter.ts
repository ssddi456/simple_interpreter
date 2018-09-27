import { Ast, AstBlock, AstBinary, AstIdentifier } from "../parser/parser";


export function getBoolean(value: any): boolean {

}

export function getBinaneryValue(ast: AstBinary): any {
    const left = getValue(ast.left);
    const right = getValue(ast.right);

    switch (ast.operator) {
        case '+':
            return left + right;
        case '-':
            return left - right;
        case '*':
            return left * right;
        case '/':
            return left / right;
    }

    throw new Error('illegal binaery operator ' + ast.operator);
}

export function getIndentifireValue(ast: AstIdentifier): any {

}

export function getValue(ast: Ast): any {

}

export function interpreter(ast: AstBlock) {

}
