var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "../parser/tokenizer"], function (require, exports, tokenizer_1) {
    "use strict";
    exports.__esModule = true;
    function makeInterpreterContext(symbolMap) {
        return {
            currentToken: undefined,
            symbolMap: __assign({}, symbolMap)
        };
    }
    function getBoolean(value, ctx) {
        var typeValue = typeof value;
        if (typeValue == 'number') {
            return value !== 0;
        }
        else if (typeValue == 'string') {
            return value !== '';
        }
        else {
            return getBoolean(getValue(value, ctx), ctx);
        }
    }
    exports.getBoolean = getBoolean;
    function getBinaneryValue(ast, ctx) {
        if (tokenizer_1.caculateOperators.indexOf(ast.operator) != -1) {
            var left = getValue(ast.left, ctx);
            var right = getValue(ast.right, ctx);
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
        }
        else if (tokenizer_1.compareOperators.indexOf(ast.operator) != -1) {
            var left = getValue(ast.left, ctx);
            var right = getValue(ast.right, ctx);
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
        }
        else if (tokenizer_1.logicOperators.indexOf(ast.operator) != -1) {
            var left = getValue(ast.left, ctx);
            switch (ast.operator) {
                case '&&':
                    if (getBoolean(left, ctx)) {
                        return getValue(ast.right, ctx);
                    }
                    else {
                        return left;
                    }
                case '||':
                    if (getBoolean(left, ctx)) {
                        return left;
                    }
                    else {
                        return getValue(ast.right, ctx);
                    }
            }
        }
        throw new Error('illegal binaery operator ' + ast.operator);
    }
    exports.getBinaneryValue = getBinaneryValue;
    function getIndentifireValue(ast, ctx) {
        return ctx.symbolMap[ast.name];
    }
    exports.getIndentifireValue = getIndentifireValue;
    function getIfValue(ast, ctx) {
        var checkValue = getBoolean(ast.expression, ctx);
        if (checkValue) {
            return getValue(ast["do"], ctx);
        }
        else if (ast["else"]) {
            return getValue(ast["else"], ctx);
        }
    }
    exports.getIfValue = getIfValue;
    function getTrinaryValue(ast, ctx) {
        var checkValue = getBoolean(ast.expression, ctx);
        if (checkValue) {
            return getValue(ast["do"], ctx);
        }
        else {
            return getValue(ast["else"], ctx);
        }
    }
    exports.getTrinaryValue = getTrinaryValue;
    function getValue(ast, ctx) {
        switch (ast.type) {
            case 'identifier':
                return getIndentifireValue(ast, ctx);
            case 'binary':
                return getBinaneryValue(ast, ctx);
            case 'if':
                getIfValue(ast, ctx);
                return;
            case 'block':
                return ast.children.reduce(function (pre, block) {
                    return getValue(block, ctx);
                }, undefined);
            case 'value':
                return ast.value;
            default:
                break;
        }
    }
    exports.getValue = getValue;
    function interpreter(ast, symbolMap) {
        var ctx = makeInterpreterContext(symbolMap);
        return getValue(ast, ctx);
    }
    exports.interpreter = interpreter;
});
