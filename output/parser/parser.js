var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "./tokenizer"], function (require, exports, tokenizer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function makeAstBlock(start, end, children) {
        return {
            type: 'block',
            children: children,
            start: start,
            end: end,
        };
    }
    exports.makeAstBlock = makeAstBlock;
    function makeAstIf(start, end, expression, _do, _else) {
        var ret = {
            start: start,
            end: end,
            type: 'if',
            expression: expression,
            do: _do
        };
        if (_else) {
            ret.else = _else;
        }
        return ret;
    }
    exports.makeAstIf = makeAstIf;
    function makeAstUnary(start, end, operator, expression) {
        return {
            start: start,
            end: end,
            type: 'unary',
            operator: operator,
            expression: expression
        };
    }
    exports.makeAstUnary = makeAstUnary;
    function makeAstBinary(start, end, operator, left, right) {
        return {
            start: start,
            end: end,
            type: 'binary',
            operator: operator,
            left: left,
            right: right
        };
    }
    exports.makeAstBinary = makeAstBinary;
    function makeAstTrinary(start, end, expression, _do, _else) {
        return {
            start: start,
            end: end,
            type: 'trinary',
            expression: expression,
            do: _do,
            else: _else
        };
    }
    exports.makeAstTrinary = makeAstTrinary;
    function makeAstValue(start, end, value) {
        return {
            start: start,
            end: end,
            type: 'value',
            value: value
        };
    }
    exports.makeAstValue = makeAstValue;
    function makeAstIdentifier(start, end, name) {
        return {
            start: start,
            end: end,
            type: 'identifier',
            name: name,
        };
    }
    exports.makeAstIdentifier = makeAstIdentifier;
    function makeAstCall(start, end, name, params) {
        return {
            start: start,
            end: end,
            type: 'call',
            name: name,
            params: params
        };
    }
    exports.makeAstCall = makeAstCall;
    function makeAstLabel(start, end, name) {
        return {
            start: start,
            end: end,
            type: 'label',
            name: name,
        };
    }
    exports.makeAstLabel = makeAstLabel;
    function makeAstComment(start, end, content) {
        return {
            start: start,
            end: end,
            type: 'comment',
            content: content
        };
    }
    exports.makeAstComment = makeAstComment;
    function toLineEnd(ctx) {
        var start = ctx.index;
        var end = start;
        var startToken = ctx.tokens[end];
        if (startToken) {
            var startLine = ctx.tokens[end].pos.line;
            while (end < ctx.tokens.length) {
                var token = ctx.tokens[end];
                if (token.pos.line != startLine) {
                    break;
                }
                end++;
            }
            return ctx.tokens.slice(start, end);
        }
        else {
            return [];
        }
    }
    exports.toLineEnd = toLineEnd;
    function toToken(ctx, stopTokens) {
        var isContext = true;
        if (!('tokens' in ctx)) {
            isContext = false;
        }
        var tokens = isContext ? ctx.tokens : ctx;
        var start = isContext ? ctx.index : 0;
        var end = start;
        while (end < tokens.length) {
            var token = getContent(tokens[end]);
            var stopAtIndex = stopTokens.indexOf(token);
            if (stopAtIndex !== -1) {
                break;
            }
            end++;
        }
        if (end >= tokens.length) {
            return {
                tokenIndex: -1,
                tokens: undefined,
                stopAt: undefined,
            };
        }
        else {
            return {
                tokenIndex: end,
                tokens: tokens.slice(start, end),
                stopAt: tokens[end]
            };
        }
    }
    exports.toToken = toToken;
    function currentToken(ctx) {
        return ctx.tokens[ctx.index];
    }
    exports.currentToken = currentToken;
    function makeAstIfAst(ctx) {
        var ifToken = currentToken(ctx);
        ctx.index += 1;
        var expression = toLineEnd(ctx);
        ctx.index += expression.length;
        var doTokens = toLineEnd(ctx);
        var end = createEndPosFromToken(ctx.tokenizerCtx, doTokens[doTokens.length - 1] || expression[expression.length - 1]);
        var doBlock = makeAstBlock(doTokens[0].pos, end, []);
        makeAst(ctx, doBlock);
        return makeAstIf(ifToken.pos, end, makeExpressionAst(ctx, expression), doBlock);
    }
    exports.makeAstIfAst = makeAstIfAst;
    function makeExpressionAst(ctx, tokens) {
        console.assert(tokens.length != 0);
        var ret;
        var startPos = getPos(tokens[0]);
        var endPos = createEndPosFromToken(ctx.tokenizerCtx, tokens[tokens.length - 1]);
        if (tokens.length == 1) {
            var val = getContent(tokens[0]);
            if (val.match(/^\d+$/)) {
                ret = makeAstValue(startPos, endPos, Number(val));
            }
            else if (val.match(/^[^\d]/)) {
                ret = makeAstIdentifier(startPos, endPos, val);
            }
            else {
                throw new Error('illegal identifier');
            }
        }
        else {
            var binaryIndex = toToken(tokens, tokenizer_1.binaryoperators);
            if (binaryIndex.tokenIndex != -1) {
                ret = makeAstBinary(startPos, endPos, getContent(binaryIndex.stopAt), makeExpressionAst(ctx, tokens.slice(0, binaryIndex.tokenIndex)), makeExpressionAst(ctx, tokens.slice(binaryIndex.tokenIndex + 1)));
            }
            else if (tokenizer_1.unaryOperators.indexOf(getContent(tokens[0])) != -1 && tokens.length == 2) {
                ret = makeAstUnary(startPos, endPos, getContent(tokens[0]), makeExpressionAst(ctx, tokens.slice(1)));
            }
            else {
                throw new Error('illegal expression');
            }
        }
        ctx.index += tokens.length;
        return ret;
    }
    exports.makeExpressionAst = makeExpressionAst;
    function makeAst(ctx, root) {
        var container = root.children;
        var tokens = ctx.tokens;
        console.log('makeAst', ctx.index, tokens.length);
        while (ctx.index < tokens.length) {
            var token = currentToken(ctx);
            var currentLineTokens = toLineEnd(ctx);
            console.log('currentLineTokens', currentLineTokens);
            var tokenContent = getContent(token);
            if ('if' == tokenContent) {
                // make if ast
                container.push(makeAstIfAst(ctx));
            }
            else {
                container.push(makeExpressionAst(ctx, currentLineTokens));
            }
        }
        return root;
    }
    exports.makeAst = makeAst;
    function makeAstSubContext(context, subContext, root) {
        var extendedContext = __assign({}, context, subContext);
        var ret = makeAst(extendedContext, root);
        context.index = extendedContext.index;
        return ret;
    }
    exports.makeAstSubContext = makeAstSubContext;
    function getContentLength(end) {
        if ('content' in end) {
            return end.content.length;
        }
        else {
            return end.end.offset - end.start.offset;
        }
    }
    function getContent(end) {
        if ('content' in end) {
            return end.content;
        }
        else {
            return '';
        }
    }
    function getPos(end) {
        if ('pos' in end) {
            return end.pos;
        }
        else {
            return end.start;
        }
    }
    function createEndPosFromToken(ctx, end) {
        var endNodePos = getPos(end);
        var endPos = tokenizer_1.getPosAtOffset({
            content: ctx.content,
            pos: __assign({}, endNodePos)
        }, endNodePos.offset + getContentLength(end));
        return endPos;
    }
    exports.createEndPosFromToken = createEndPosFromToken;
    function makeParserContext(tokenizerCtx, tokens) {
        return {
            tokens: tokens,
            tokenizerCtx: tokenizerCtx,
            index: 0,
            stopTokens: []
        };
    }
    function parser(content) {
        var ctx = tokenizer_1.makeTokenizerContext(content);
        var tokens = tokenizer_1.tokenize(ctx);
        console.log(tokens);
        var end = createEndPosFromToken(ctx, tokens[tokens.length - 1]);
        var parserContext = makeParserContext(ctx, tokens);
        return makeAst(parserContext, makeAstBlock(getPos(tokens[0]), end, []));
    }
    exports.parser = parser;
});
