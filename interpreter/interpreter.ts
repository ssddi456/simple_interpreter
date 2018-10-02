import { Ast, AstBlock, AstBinary, AstIdentifier, AstIf, AstTrinary } from "../parser/parser";
import { caculateOperators, CaculateOperator, conpareOperators, ConpareOperator, logicOperators, LogicOperator } from "../parser/tokenizer";


interface SymbolMap {
    [k: string]: string | number;
}
interface InterpreterContext {
    currentToken?: Ast;
    symbolMap: SymbolMap;
}
function makeInterpreterContext(symbolMap?: SymbolMap): InterpreterContext{
    return {
        currentToken: undefined,
        symbolMap: {
            ...symbolMap
        }
    };
}

export function getBoolean(value: Ast | string | number, ctx): boolean {
    const typeValue = typeof value;
    if (typeValue == 'number') {
        return value !== 0;
    } else if (typeValue == 'string') {
        return value !== '';
    } else {
        return getBoolean(getValue(value as Ast, ctx), ctx);
    }
}


export function getBinaneryValue(ast: AstBinary, ctx: InterpreterContext): any {

    if (caculateOperators.indexOf(ast.operator as CaculateOperator) != -1) {
        const left = getValue(ast.left, ctx);
        const right = getValue(ast.right, ctx);
        switch (ast.operator) {
            case '+':
                return left + right;
            case '-':
                return left - right;
            case '*':
                return left * right;
            case '/':
                return left / right;
            case '&':
                return left & right;
            case '|':
                return left | right;
        }
    } else if (conpareOperators.indexOf(ast.operator as ConpareOperator) != -1) {
        const left = getValue(ast.left, ctx);
        const right = getValue(ast.right, ctx);
        switch (ast.operator) {
            case '!=':
                return left != right;
            case '!==':
                return left !== right;
            case '==':
                return left == right;
            case '<=':
                return left <= right;
            case '<':
                return left < right;
            case '>':
                return left > right;
            case '>=':
                return left >= right;
        }
    } else if (logicOperators.indexOf(ast.operator as LogicOperator) != -1) {
        const left = getValue(ast.left, ctx);
        switch (ast.operator) {
            case '&&':
                if (getBoolean(left, ctx)) {
                    return getValue(ast.right, ctx);
                } else {
                    return left;
                }
            case '||':
                if (getBoolean(left, ctx)) {
                    return left;
                } else {
                    return getValue(ast.right, ctx);
                }
        }
    }
    throw new Error('illegal binaery operator ' + ast.operator);
}

export function getIndentifireValue(ast: AstIdentifier, ctx: InterpreterContext): any {
    return ctx.symbolMap[ast.name];
}

export function getIfValue(ast: AstIf, ctx: InterpreterContext): void {
    const checkValue = getBoolean(ast.expression, ctx);
    if (checkValue) {
        return getValue(ast.do, ctx);
    } else if (ast.else) {
        return getValue(ast.else, ctx);
    }
}

export function getTrinaryValue(ast: AstTrinary, ctx: InterpreterContext): any {
    const checkValue = getBoolean(ast.expression, ctx);
    if (checkValue) {
        return getValue(ast.do, ctx);
    } else {
        return getValue(ast.else, ctx);
    }
}

export function getValue(ast: Ast, ctx: InterpreterContext): any {
    switch (ast.type) {
        case 'identifier':
            return getIndentifireValue(ast, ctx);
        case 'binary':
            return getBinaneryValue(ast, ctx);
        case 'if':
            getIfValue(ast, ctx);
            return;
        case 'block':
            return ast.children.reduce(function( pre: any, block ){
                return getValue(block, ctx);
            }, undefined);
        case 'value':
            return ast.value;
        default:
            break;
    }
}

export function interpreter(ast: AstBlock, symbolMap?:SymbolMap) {
    const ctx = makeInterpreterContext(symbolMap);
    return getValue(ast, ctx);
}
