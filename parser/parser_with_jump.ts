import { UnaryOperator, BinaryOperator, makeTokenizerContext, tokenize, Range, Pos, Token, TokenizerContext, getPosAtOffset, binaryoperators, unaryOperators, labelMaker, assignmentOperators, AssignmentOperator, logicOperators } from "./tokenizer";
import { AstBase } from "./parser";


export interface AstIf extends AstBase {
    type: 'if',
    expression: AstExpression;
}

export function makeAstIf(start: Pos, end: Pos, expression: AstExpression): AstIf {
    const ret: AstIf = {
        start,
        end,
        type: 'if',
        expression,
    };

    return ret;
}

export interface AstElse extends AstBase {
    type: 'else',
}

export function makeAstElse(start: Pos, end: Pos): AstElse {
    return {
        start,
        end,
        type: 'else'
    };
}

export interface AstEndIf extends AstBase {
    type: 'endif'
}

export function makeAstEndIf(start: Pos, end: Pos): AstEndIf {
    return {
        start,
        end,
        type: 'endif'
    };
}
export interface AstEndFor extends AstBase {
    type: 'endfor'
}
export function makeAstEndFor(start: Pos, end: Pos): AstEndFor {
    return {
        start,
        end,
        type: 'endfor'
    };
}

export function makeAstSingleWordDirectiveWrapper<T>(wrapper: (start: Pos, end: Pos) => T): (token: Token) => T {
    return function (token: Token): T {
        return wrapper(getPos(token), getEndPos(token));
    };
}

export const makeAstElseFromToken = makeAstSingleWordDirectiveWrapper(makeAstElse);
export const makeAstEndIfFromToken = makeAstSingleWordDirectiveWrapper(makeAstEndIf);
export const makeAstEndForFromToken = makeAstSingleWordDirectiveWrapper(makeAstEndFor);

export interface AstUnary extends AstBase {
    type: 'unary';
    operator: UnaryOperator;
    expression: AstExpression;
}
export function makeAstUnary(start: Pos, end: Pos, operator: UnaryOperator, expression: AstExpression): AstUnary {
    return {
        start,
        end,
        type: 'unary',
        operator,
        expression
    };
}
export interface AstBinary extends AstBase {
    type: 'binary';
    operator: BinaryOperator;
    left: AstExpression;
    right: AstExpression;
}

export function makeAstBinary(start: Pos, end: Pos, operator: BinaryOperator, left: AstExpression, right: AstExpression): AstBinary {
    return {
        start,
        end,
        type: 'binary',
        operator,
        left,
        right
    };
}

export interface AstTrinary extends AstBase {
    type: 'trinary';
    expression: AstExpression;
    do: AstExpression;
    else: AstExpression;
}

export function makeAstTrinary(start: Pos, end: Pos, expression: AstExpression, _do: AstExpression, _else: AstExpression): AstTrinary {
    return {
        start,
        end,
        type: 'trinary',
        expression,
        do: _do,
        else: _else
    };
}

export interface AstValue extends AstBase {
    type: 'value';
    value: string | number;
}
export function makeAstValue(start: Pos, end: Pos, value: number | string): AstValue {
    return {
        start,
        end,
        type: 'value',
        value
    };
}

export interface AstIdentifier extends AstBase {
    type: 'identifier';
    name: string;
}

export function makeAstIdentifier(start: Pos, end: Pos, name: string): AstIdentifier {
    return {
        start,
        end,
        type: 'identifier',
        name,
    }
}
export function makeAstIdentifierFromToken(token: Token): AstIdentifier {
    return makeAstIdentifier(
        getPos(token),
        getEndPos(token),
        getContent(token)
    );
}

export interface AstCall extends AstBase {
    type: 'call';
    name: AstIdentifier;
    params: AstExpression[];
}

export function makeAstCall(start: Pos, end: Pos, name: AstIdentifier, params: AstExpression[]): AstCall {
    return {
        start,
        end,
        type: 'call',
        name,
        params
    };
}

export interface AstLabel extends AstBase {
    type: 'label';
    name: string;
}
export function makeAstLabel(start: Pos, end: Pos, name: string): AstLabel {
    return {
        start,
        end,
        type: 'label',
        name,
    }
}

export interface AstJump extends AstBase {
    type: 'jump',
    labelName: string
}

export function makeAstJump(start: Pos, end: Pos, labelName: string): AstJump {
    return {
        start,
        end,
        type: 'jump',
        labelName,
    };
}

export interface AstComment extends AstBase {
    type: 'comment';
    content: string;
}
export function makeAstComment(start: Pos, end: Pos, content: string): AstComment {
    return {
        start,
        end,
        type: 'comment',
        content
    };
}

export type AstExpression = AstUnary | AstBinary | AstTrinary | AstValue | AstIdentifier | AstCall;

export type Ast = AstExpression | AstLabel | AstComment | AstIf | AstElse | AstEndIf | AstEndFor | AstJump;

export function toLineEnd(ctx: ParserContext): Token[] {
    const start = ctx.index;
    let end = start;

    const startToken = ctx.tokens[end];

    if (startToken) {
        const startLine = ctx.tokens[end].pos.line;
        while (end < ctx.tokens.length) {
            const token = ctx.tokens[end];
            if (token.pos.line != startLine) {
                break;
            }
            end++;
        }
        return ctx.tokens.slice(start, end);
    } else {
        return [];
    }
}

export function toToken(ctx: ParserContext | ParserNode[], stopTokens: string[]) {
    const isContext = 'tokens' in ctx;
    const tokens = isContext ? (<ParserContext>ctx).tokens : <ParserNode[]>ctx;
    const start = isContext ? (<ParserContext>ctx).index : 0;

    let end = start;
    while (end < tokens.length) {
        const token = getContent(tokens[end]);
        const stopAtIndex = stopTokens.indexOf(token);
        if (stopAtIndex !== -1) {
            break;
        }
        end++;
    }

    if (end >= tokens.length) {
        return {
            tokenIndex: -1,
            tokens: tokens.slice(start, end),
            stopAt: undefined,
        };
    } else {
        return {
            tokenIndex: end,
            tokens: tokens.slice(start, end),
            stopAt: tokens[end]
        };
    }
}

export function currentToken(ctx: ParserContext): Token {
    return ctx.tokens[ctx.index];
}

export function makeAstIfAst(ctx: ParserContext): AstIf {
    console.log('start make if');

    const ifToken = currentToken(ctx);
    ctx.index += 1;

    const expressionTokensInfo = toToken(ctx, [':']);

    ctx.index = expressionTokensInfo.tokenIndex + 1;
    const expression = expressionTokensInfo.tokens as Token[];
    console.log('end if line ', ctx.index);

    const end = createEndPosFromToken(ctx.tokenizerCtx, expression[expression.length - 1]);
    return makeAstIf(ifToken.pos, end, makeLogicExpressionAst(expression));
}

class ParseError extends Error {
    constructor(public msg: string, public token: ParserNode) {
        super(msg);
    }
}

export function makeLogicExpressionAst(tokens: Token[]): AstExpression {
    /**
     * 7bh并没有隐式类型转换，所以直接在这里先搜索逻辑运算符再搜索比较运算符即可。
     */

    let idx = 0;
    let searchInToken = tokens.slice();
    let firstLoop = true;
    let leftOperator: AstExpression | undefined = undefined;
    let logicOperator: BinaryOperator | undefined = undefined;

    do {
        const logicTokenInfo = toToken(searchInToken, logicOperators);
        const compareTokens = logicTokenInfo.tokens as Token[];
        const [left, operator, right] = compareTokens;

        const rightOperator = makeAstBinary(getPos(left), getEndPos(right), getContent(operator) as BinaryOperator,
            makeAstIdentifierFromToken(left), makeAstIdentifierFromToken(right));

        if (!firstLoop) {
            leftOperator = makeAstBinary(
                getPos(leftOperator as AstExpression), getEndPos(rightOperator),
                logicOperator as BinaryOperator,
                leftOperator as AstExpression, rightOperator
            );
        } else {
            firstLoop = false;
            leftOperator = rightOperator;
        }

        if (logicTokenInfo.stopAt) {
            logicOperator = getContent(logicTokenInfo.stopAt) as BinaryOperator;
        }

        idx += compareTokens.length;
    } while (idx < tokens.length);

    return leftOperator;
}

export function makeExpressionAst(ctx: ParserContext, tokens: Token[]): AstExpression {
    if (tokens.length == 0) {
        throw new ParseError('empty', currentToken(ctx));
    }

    let ret: AstExpression;
    const startPos = getPos(tokens[0]);
    const endPos = getEndPos(tokens[tokens.length - 1]);
    if (tokens.length == 1) {
        const val = getContent(tokens[0]);
        if (val.match(/^\d+$/)) {
            ret = makeAstValue(startPos, endPos, Number(val));
        } else if (val.match(/^[^\d]/)) {
            ret = makeAstIdentifier(startPos, endPos, val);
        } else {
            throw new ParseError('illegal identifier', tokens[0]);
        }
    } else {
        const binaryIndex = toToken(tokens, binaryoperators);
        const tokenContent = getContent(tokens[0]);

        console.log('binary index', ctx.index, binaryIndex);

        if (binaryIndex.tokenIndex != -1) {
            ret = makeAstBinary(startPos, endPos,
                getContent(binaryIndex.stopAt as ParserNode) as BinaryOperator,
                makeExpressionAst(cloneCtx(ctx), tokens.slice(0, binaryIndex.tokenIndex)),
                makeExpressionAst(cloneCtx(ctx), tokens.slice(binaryIndex.tokenIndex + 1)),
            );
        } else if (unaryOperators.indexOf(tokenContent as UnaryOperator) != -1 && tokens.length == 2) {
            ret = makeAstUnary(startPos, endPos,
                tokenContent as UnaryOperator,
                makeExpressionAst(cloneCtx(ctx), tokens.slice(1)));
        } else if ('nearest' == tokenContent) {
            const secondTokenContent = getContent(tokens[1]);
            if (objectType.indexOf(secondTokenContent) !== -1) {
                ret = makeAstCall(startPos, endPos, makeAstIdentifierFromToken(tokens[0]), [makeAstIdentifierFromToken(tokens[1])]);
            } else {
                throw new ParseError('illegal expression', tokens[1]);
            }
        } else {
            throw new ParseError('illegal expression', tokens[1]);
        }
    }

    ctx.index += tokens.length;
    return ret;
}

const preservedWords = [
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

    'mem1',
    'mem2',
    'mem3',
    'mem4',
];

const buildInFunctions = [
    'step',
    'pickup',
    'drop',
];

const singleWordDirectives = [
    'endfor',
    'else',
    'endif',
];

const objectType = [
    'datacube',
    'wall'
]

export function makeListAst(tokens: Token[]): AstExpression[] {
    if (!tokens.length) {
        return [];
    } else {
        const ret = [] as AstIdentifier[];
        for (let i = 0; i < tokens.length; i += 2) {
            const element = tokens[i];
            ret.push(makeAstIdentifier(getPos(element), getEndPos(element), element.content));
        }

        return ret;
    }

}

export function cloneCtx(ctx: ParserContext): ParserContext {
    return { ...ctx };
}

export function makeAst(ctx: ParserContext): Ast[] {
    const container = [] as Ast[];
    const tokens = ctx.tokens;
    console.log('makeAst', ctx.index, tokens.length);
    while (ctx.index < tokens.length) {
        const token = currentToken(ctx);
        const currentLineTokens = toLineEnd(ctx);
        const startPos = getPos(currentLineTokens[0]);
        const endPos = createEndPosFromToken(ctx.tokenizerCtx, currentLineTokens[currentLineTokens.length - 1]);

        console.log('currentLineTokens', currentLineTokens.map(getContent));

        const tokenContent = getContent(token);
        const secondTokenContent = getContent(currentLineTokens[1]);

        if (currentLineTokens.length == 2 && labelMaker == secondTokenContent) {
            container.push(makeAstLabel(startPos, getPos(currentLineTokens[1]), currentLineTokens[0].content));
            ctx.index += 2;
        } else if (buildInFunctions.indexOf(tokenContent) != -1) {
            // other directions
            container.push(makeAstCall(startPos, endPos,
                makeAstIdentifier(startPos, createEndPosFromToken(ctx.tokenizerCtx, currentLineTokens[0]), tokenContent),
                makeListAst(currentLineTokens.slice(1)) // create tokens here
            ));
            ctx.index += currentLineTokens.length;
        } else if (singleWordDirectives.indexOf(tokenContent) != -1) {
            switch (tokenContent) {
                case 'endfor':
                    container.push(makeAstEndForFromToken(currentLineTokens[0]));
                    break;
                case 'else':
                    container.push(makeAstElseFromToken(currentLineTokens[0]));
                    break;
                case 'endif':
                    container.push(makeAstEndIfFromToken(currentLineTokens[0]));
                    break;
            }
            ctx.index += 1;
        } else if ('jump' == tokenContent) {
            // jump direction
            container.push(makeAstJump(startPos, endPos, secondTokenContent));
            ctx.index += currentLineTokens.length;
        } else if ('if' == tokenContent) {
            // if direction
            container.push(makeAstIfAst(ctx));
        } else if (binaryoperators.indexOf(secondTokenContent as AssignmentOperator) != -1) {
            // binary
            console.log('start make binary', ctx.index);
            container.push(makeExpressionAst(ctx, currentLineTokens));
            console.log('end make binary', ctx.index);
        } else {
            throw new ParseError('unknow syntax', token);
        }
    }
    return container;
}


type ParserNode = Token | Ast;
function getContentLength(end: ParserNode): number {
    if ('content' in end) {
        return end.content.length;
    } else {
        return end.end.offset - end.start.offset;
    }
}

function getContent(end: ParserNode): string {
    if (end && 'content' in end) {
        return end.content;
    } else {
        return '';
    }
}

function getPos(end: ParserNode): Pos {
    if ('pos' in end) {
        return end.pos;
    } else {
        return end.start;
    }
}
function getEndPos(token: ParserNode): Pos {
    const pos = getPos(token);
    const content = getContent(token);
    return {
        line: pos.line,
        row: pos.row + content.length,
        offset: pos.offset + content.length
    };
}
export function createEndPosFromToken(ctx: TokenizerContext, end: ParserNode) {
    const endNodePos = getPos(end);

    const endPos: Pos = getPosAtOffset({
        content: ctx.content,
        pos: { ...endNodePos }
    }, endNodePos.offset + getContentLength(end));

    return endPos;
}

export interface ParserContext {
    tokens: Token[];
    index: number;
    tokenizerCtx: TokenizerContext;
    stopTokens: string[]
}

export function makeParserContext(tokenizerCtx: TokenizerContext, tokens: Token[]): ParserContext {
    return {
        tokens,
        tokenizerCtx,
        index: 0,
        stopTokens: []
    };
}

export function parserWithJump(content: string): Ast[] {
    const ctx = makeTokenizerContext(content);
    const tokens = tokenize(ctx);
    console.log(tokens);
    const parserContext = makeParserContext(ctx, tokens);

    return makeAst(parserContext);
}
