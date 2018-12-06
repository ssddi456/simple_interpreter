var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.unaryOperators = ['!', '-'];
    exports.caculateOperators = ['+', '-', '*', '/', '&', '|'];
    exports.compareOperators = ['!=', '!==', '==', '<=', '<', '>', '>='];
    exports.logicOperators = ['||', '&&', 'and', 'or'];
    exports.assignmentOperators = ['='];
    exports.binaryoperators = exports.caculateOperators.concat(exports.compareOperators, exports.logicOperators, exports.assignmentOperators);
    exports.trinaryOperators = ['?', ':'];
    exports.labelMaker = ':';
    exports.callOperator = '(';
    exports.callEnd = ')';
    exports.comma = ',';
    exports.whiteSpace = ' ';
    exports.comment = '//';
    exports.operators = exports.binaryoperators.concat(exports.unaryOperators, exports.trinaryOperators, [exports.callOperator, exports.comma, exports.callEnd, exports.comment, exports.whiteSpace]);
    exports.lineEnd = '\n';
    function makeTokenizerContext(content) {
        return {
            content: content,
            pos: {
                line: 0,
                row: 0,
                offset: 0
            }
        };
    }
    exports.makeTokenizerContext = makeTokenizerContext;
    function subContext(ctx) {
        return {
            content: ctx.content,
            pos: {
                line: ctx.pos.line,
                row: ctx.pos.row,
                offset: ctx.pos.offset
            }
        };
    }
    exports.subContext = subContext;
    function skipWhiteSpace(ctx) {
        var content = ctx.content;
        var pos = ctx.pos;
        var len = content.length;
        for (var i = pos.offset; i < len; i++) {
            var element = content[i];
            if (element == exports.whiteSpace) {
                pos.offset += 1;
                pos.row += 1;
            }
            else if (element == exports.lineEnd) {
                pos.offset += 1;
                pos.line += 1;
                pos.row = 0;
            }
            else {
                return;
            }
        }
    }
    exports.skipWhiteSpace = skipWhiteSpace;
    function getToken(ctx, stopTokens) {
        if (stopTokens === void 0) { stopTokens = exports.operators; }
        var content = ctx.content;
        var len = content.length;
        var nextLineEnd = content.indexOf(exports.lineEnd, ctx.pos.offset);
        var indexOffset = nextLineEnd !== -1 ? nextLineEnd : len;
        var stopAt;
        for (var i = 0; i < stopTokens.length; i++) {
            var element = stopTokens[i];
            var idx = content.indexOf(element, ctx.pos.offset);
            if (idx !== -1) {
                if (idx < indexOffset) {
                    indexOffset = idx;
                    stopAt = element;
                }
                if (idx == indexOffset && element.length > stopAt.length) {
                    stopAt = element;
                }
            }
        }
        return {
            indexOffset: indexOffset,
            token: getText(ctx.content, ctx.pos, indexOffset),
            stopAt: stopAt
        };
    }
    exports.getToken = getToken;
    function toOffset(ctx, offset) {
        var content = ctx.content;
        offset = Math.min(offset, content.length);
        ;
        var pos = ctx.pos;
        var nextLineEnd = content.slice(0, offset).indexOf(exports.lineEnd, pos.offset);
        if (nextLineEnd < offset && nextLineEnd !== -1) {
            while (nextLineEnd < offset && nextLineEnd !== -1) {
                pos.line += 1;
                pos.row = offset - nextLineEnd - 1;
                nextLineEnd = content.indexOf(exports.lineEnd, nextLineEnd + 1);
            }
        }
        else {
            pos.row += offset - pos.offset;
        }
        pos.offset = offset;
    }
    exports.toOffset = toOffset;
    function addOffset(ctx, offsetAdd) {
        toOffset(ctx, ctx.pos.offset + offsetAdd);
    }
    exports.addOffset = addOffset;
    function getText(content, start, end) {
        if (typeof start != 'number') {
            start = start.offset;
        }
        if (typeof end != 'number') {
            end = end.offset;
        }
        return content.slice(start, end);
    }
    exports.getText = getText;
    function getPosAtOffset(ctx, offset) {
        var pos = __assign({}, ctx.pos);
        var content = ctx.content;
        var len = Math.min(content.length, offset);
        for (var i = pos.offset; i < len; i++) {
            var element = content[i];
            if (element) {
                if (element !== exports.lineEnd) {
                    pos.offset += 1;
                    pos.row += 1;
                }
                else {
                    pos.offset += 1;
                    pos.line += 1;
                    pos.row = 0;
                }
            }
            else {
                break;
            }
        }
        return pos;
    }
    exports.getPosAtOffset = getPosAtOffset;
    function tokenize(ctx) {
        var content = ctx.content;
        var tokens = [];
        while (ctx.pos.offset < content.length) {
            skipWhiteSpace(ctx);
            var _a = getToken(ctx), indexOffset = _a.indexOffset, token = _a.token, stopAt = _a.stopAt;
            if (token) {
                tokens.push({
                    content: token,
                    pos: __assign({}, ctx.pos)
                });
                addOffset(ctx, token.length);
            }
            if (stopAt) {
                if (stopAt !== exports.lineEnd && stopAt !== exports.whiteSpace) {
                    tokens.push({
                        content: stopAt,
                        pos: __assign({}, ctx.pos)
                    });
                    addOffset(ctx, stopAt.length);
                }
            }
        }
        return tokens;
    }
    exports.tokenize = tokenize;
});
