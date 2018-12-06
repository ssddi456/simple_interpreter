var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    exports.__esModule = true;
    function makeAstIf(start, end, expression) {
        var ret = {
            start: start,
            end: end,
            type: 'if',
            expression: expression
        };
        return ret;
    }
    exports.makeAstIf = makeAstIf;
    function makeAstElse(start, end) {
        return {
            start: start,
            end: end,
            type: 'else'
        };
    }
    exports.makeAstElse = makeAstElse;
    function makeAstEndIf(start, end) {
        return {
            start: start,
            end: end,
            type: 'endif'
        };
    }
    exports.makeAstEndIf = makeAstEndIf;
    function makeAstEndFor(start, end) {
        return {
            start: start,
            end: end,
            type: 'endfor'
        };
    }
    exports.makeAstEndFor = makeAstEndFor;
    function makeAstSingleWordDirectiveWrapper(wrapper) {
        return function (token) {
            return wrapper(getPos(token), getEndPos(token));
        };
    }
    exports.makeAstSingleWordDirectiveWrapper = makeAstSingleWordDirectiveWrapper;
    exports.makeAstElseFromToken = makeAstSingleWordDirectiveWrapper(makeAstElse);
    exports.makeAstEndIfFromToken = makeAstSingleWordDirectiveWrapper(makeAstEndIf);
    exports.makeAstEndForFromToken = makeAstSingleWordDirectiveWrapper(makeAstEndFor);
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
            "do": _do,
            "else": _else
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
            name: name
        };
    }
    exports.makeAstIdentifier = makeAstIdentifier;
    function makeAstIdentifierFromToken(token) {
        return makeAstIdentifier(getPos(token), getEndPos(token), getContent(token));
    }
    exports.makeAstIdentifierFromToken = makeAstIdentifierFromToken;
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
            name: name
        };
    }
    exports.makeAstLabel = makeAstLabel;
    function makeAstJump(start, end, labelName) {
        return {
            start: start,
            end: end,
            type: 'jump',
            labelName: labelName
        };
    }
    exports.makeAstJump = makeAstJump;
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
        var isContext = 'tokens' in ctx;
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
                tokens: tokens.slice(start, end),
                stopAt: undefined
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
        console.log('start make if');
        var ifToken = currentToken(ctx);
        ctx.index += 1;
        var expressionTokensInfo = toToken(ctx, [':']);
        ctx.index = expressionTokensInfo.tokenIndex + 1;
        var expression = expressionTokensInfo.tokens;
        console.log('end if line ', ctx.index);
        var end = createEndPosFromToken(ctx.tokenizerCtx, expression[expression.length - 1]);
        return makeAstIf(ifToken.pos, end, makeLogicExpressionAst(expression));
    }
    exports.makeAstIfAst = makeAstIfAst;
    var ParseError = /** @class */ (function (_super) {
        __extends(ParseError, _super);
        function ParseError(msg, token) {
            var _this = _super.call(this, msg) || this;
            _this.msg = msg;
            _this.token = token;
            return _this;
        }
        return ParseError;
    }(Error));
    function makeLogicExpressionAst(tokens) {
        /**
         * 7bh并没有隐式类型转换，所以直接在这里先搜索逻辑运算符再搜索比较运算符即可。
         */
        var idx = 0;
        var searchInToken = tokens.slice();
        var firstLoop = true;
        var leftOperator = undefined;
        var logicOperator = undefined;
        do {
            var logicTokenInfo = toToken(searchInToken, tokenizer_1.logicOperators);
            console.log(JSON.stringify(logicTokenInfo));
            var compareTokens = logicTokenInfo.tokens;
            var left = compareTokens[0], operator = compareTokens[1], right = compareTokens[2];
            var rightOperator = makeAstBinary(getPos(left), getEndPos(right), getContent(operator), makeAstIdentifierFromToken(left), makeAstIdentifierFromToken(right));
            if (!firstLoop) {
                console.log('loop through and/or', JSON.stringify(getPos(leftOperator)), JSON.stringify(getEndPos(rightOperator)));
                leftOperator = makeAstBinary(getPos(leftOperator), getEndPos(rightOperator), logicOperator, leftOperator, rightOperator);
            }
            else {
                firstLoop = false;
                leftOperator = rightOperator;
            }
            idx += compareTokens.length;
            if (logicTokenInfo.stopAt) {
                logicOperator = getContent(logicTokenInfo.stopAt);
                idx += 1;
                searchInToken = searchInToken.slice(4);
            }
            else {
                searchInToken = searchInToken.slice(3);
            }
        } while (idx < tokens.length);
        return leftOperator;
    }
    exports.makeLogicExpressionAst = makeLogicExpressionAst;
    function makeExpressionAst(ctx, tokens) {
        if (tokens.length == 0) {
            throw new ParseError('empty', currentToken(ctx));
        }
        var ret;
        var startPos = getPos(tokens[0]);
        var endPos = getEndPos(tokens[tokens.length - 1]);
        console.log('makeExpressionAst', JSON.stringify(startPos), JSON.stringify(endPos));
        if (tokens.length == 1) {
            var val = getContent(tokens[0]);
            if (val.match(/^\d+$/)) {
                ret = makeAstValue(startPos, endPos, Number(val));
            }
            else if (val.match(/^[^\d]/)) {
                ret = makeAstIdentifier(startPos, endPos, val);
            }
            else {
                throw new ParseError('illegal identifier', tokens[0]);
            }
        }
        else {
            var binaryIndex = toToken(tokens, tokenizer_1.binaryoperators);
            var tokenContent = getContent(tokens[0]);
            console.log('binary index', ctx.index, binaryIndex);
            if (binaryIndex.tokenIndex != -1) {
                ret = makeAstBinary(startPos, endPos, getContent(binaryIndex.stopAt), makeExpressionAst(cloneCtx(ctx), tokens.slice(0, binaryIndex.tokenIndex)), makeExpressionAst(cloneCtx(ctx), tokens.slice(binaryIndex.tokenIndex + 1)));
            }
            else if (tokenizer_1.unaryOperators.indexOf(tokenContent) != -1 && tokens.length == 2) {
                ret = makeAstUnary(startPos, endPos, tokenContent, makeExpressionAst(cloneCtx(ctx), tokens.slice(1)));
            }
            else if ('nearest' == tokenContent) {
                var secondTokenContent = getContent(tokens[1]);
                if (exports.objectTypes.indexOf(secondTokenContent) !== -1) {
                    ret = makeAstCall(startPos, endPos, makeAstIdentifierFromToken(tokens[0]), [makeAstIdentifierFromToken(tokens[1])]);
                }
                else {
                    throw new ParseError('illegal expression', tokens[1]);
                }
            }
            else {
                throw new ParseError('illegal expression', tokens[1]);
            }
        }
        ctx.index += tokens.length;
        return ret;
    }
    exports.makeExpressionAst = makeExpressionAst;
    var preservedWords = [
        'nearest',
        'and',
        'nw',
        'w',
        'sw',
        'n',
        's',
        'ne',
        'e',
        'se',
        'if',
        'endif',
    ];
    exports.memories = [
        'mem1',
        'mem2',
        'mem3',
        'mem4',
    ];
    exports.voidFunctions = [
        'step',
        'pickup',
        'drop',
        'write',
    ];
    exports.valuedFunctions = [
        'nearest',
    ];
    var singleWordDirectives = [
        'endfor',
        'else',
        'endif',
    ];
    exports.objectTypes = [
        'datacube',
        'worker',
        'nothing',
        'wall',
    ];
    function makeListAst(tokens) {
        if (!tokens.length) {
            return [];
        }
        else {
            var ret = [];
            for (var i = 0; i < tokens.length; i += 2) {
                var element = tokens[i];
                ret.push(makeAstIdentifier(getPos(element), getEndPos(element), element.content));
            }
            return ret;
        }
    }
    exports.makeListAst = makeListAst;
    function cloneCtx(ctx) {
        return __assign({}, ctx);
    }
    exports.cloneCtx = cloneCtx;
    function makeAst(ctx) {
        var container = [];
        var tokens = ctx.tokens;
        console.log('makeAst', ctx.index, tokens.length);
        while (ctx.index < tokens.length) {
            var token = currentToken(ctx);
            var currentLineTokens = toLineEnd(ctx);
            var startPos = getPos(currentLineTokens[0]);
            var endPos = createEndPosFromToken(ctx.tokenizerCtx, currentLineTokens[currentLineTokens.length - 1]);
            console.log('currentLineTokens', currentLineTokens.map(getContent));
            var tokenContent = getContent(token);
            var secondTokenContent = getContent(currentLineTokens[1]);
            if (currentLineTokens.length == 2 && tokenizer_1.labelMaker == secondTokenContent) {
                container.push(makeAstLabel(startPos, getPos(currentLineTokens[1]), currentLineTokens[0].content));
                ctx.index += 2;
            }
            else if (exports.voidFunctions.indexOf(tokenContent) != -1) {
                // other directions
                container.push(makeAstCall(startPos, endPos, makeAstIdentifier(startPos, createEndPosFromToken(ctx.tokenizerCtx, currentLineTokens[0]), tokenContent), makeListAst(currentLineTokens.slice(1)) // create tokens here
                ));
                ctx.index += currentLineTokens.length;
            }
            else if (singleWordDirectives.indexOf(tokenContent) != -1) {
                switch (tokenContent) {
                    case 'endfor':
                        container.push(exports.makeAstEndForFromToken(currentLineTokens[0]));
                        break;
                    case 'else':
                        container.push(exports.makeAstElseFromToken(currentLineTokens[0]));
                        break;
                    case 'endif':
                        container.push(exports.makeAstEndIfFromToken(currentLineTokens[0]));
                        break;
                }
                ctx.index += 1;
            }
            else if ('jump' == tokenContent) {
                // jump direction
                container.push(makeAstJump(startPos, endPos, secondTokenContent));
                ctx.index += currentLineTokens.length;
            }
            else if ('if' == tokenContent) {
                // if direction
                container.push(makeAstIfAst(ctx));
            }
            else if (tokenizer_1.binaryoperators.indexOf(secondTokenContent) != -1) {
                // binary
                console.log('start make binary', ctx.index);
                container.push(makeExpressionAst(ctx, currentLineTokens));
                console.log('end make binary', ctx.index);
            }
            else {
                throw new ParseError('unknow syntax', token);
            }
        }
        return container;
    }
    exports.makeAst = makeAst;
    function makeJumpTable(asts) {
        var ret = {
            labelMap: {},
            labelPosMap: {},
            ifMap: [],
            ifPosMap: [],
            jumpMap: []
        };
        var ifStack = [];
        var currentIf = undefined;
        function startIfStack(ast) {
            var ret = {
                "if": ast
            };
            ifStack.push(ret);
            currentIf = ret;
        }
        function endIfStack(ast) {
            if (currentIf == undefined) {
                throw new ParseError('illegal endif element', ast);
            }
            currentIf.endif = ast;
            ifStack.pop();
            ret.ifMap.push(currentIf);
            ret.ifPosMap.push({
                "if": currentIf["if"],
                "else": currentIf["else"] && asts.indexOf(currentIf["else"]),
                endif: asts.indexOf(currentIf.endif)
            });
            currentIf = ifStack[ifStack.length - 1];
        }
        var jumps = [];
        for (var i = 0; i < asts.length; i++) {
            var element = asts[i];
            if (element.type == 'label') {
                ret.labelMap[element.name] = element;
                ret.labelPosMap[element.name] = i;
            }
            else if (element.type == 'if') {
                startIfStack(element);
            }
            else if (element.type == 'else') {
                if (currentIf === undefined) {
                    throw new ParseError('illegal else element', element);
                }
                else {
                    currentIf["else"] = element;
                }
            }
            else if (element.type == 'endif') {
                endIfStack(element);
            }
            else if (element.type == 'jump') {
                jumps.push(element);
            }
        }
        for (var i = 0; i < jumps.length; i++) {
            var element = jumps[i];
            if (!ret.labelMap[element.labelName]) {
                throw new ParseError('no label name ' + element.labelName, element);
            }
            ret.jumpMap.push({
                jump: element,
                label: ret.labelMap[element.labelName]
            });
        }
        return ret;
    }
    exports.makeJumpTable = makeJumpTable;
    function getContentLength(end) {
        if ('content' in end) {
            return end.content.length;
        }
        else {
            return end.end.offset - end.start.offset;
        }
    }
    function getContent(end) {
        if (end && 'content' in end) {
            return end.content;
        }
        else {
            return '';
        }
    }
    function getPos(token) {
        if ('pos' in token) {
            return token.pos;
        }
        else {
            return token.start;
        }
    }
    function getEndPos(token) {
        var pos = getPos(token);
        var contentLength = 0;
        if ('content' in token) {
            contentLength = token.content.length;
            return {
                line: pos.line,
                row: pos.row + contentLength,
                offset: pos.offset + contentLength
            };
        }
        else if ('end' in token) {
            return token.end;
        }
        else {
            throw new ParseError('illegal token', token);
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
    exports.makeParserContext = makeParserContext;
    function parserWithJump(content) {
        var ctx = tokenizer_1.makeTokenizerContext(content);
        var tokens = tokenizer_1.tokenize(ctx);
        console.log(tokens);
        var parserContext = makeParserContext(ctx, tokens);
        return makeAst(parserContext);
    }
    exports.parserWithJump = parserWithJump;
});
