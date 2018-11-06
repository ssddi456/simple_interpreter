import { UnaryOperator, BinaryOperator, makeTokenizerContext, tokenize, Range, Pos, Token, TokenizerContext, getPosAtOffset, binaryoperators, unaryOperators, labelMaker, assignmentOperators } from "./tokenizer";
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

export type Ast = AstExpression | AstLabel | AstComment | AstIf | AstElse | AstEndIf | AstJump;

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
    let isContext = true;
    if (!('tokens' in ctx)) {
        isContext = false;
    }
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
            tokens: undefined,
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
    const ifToken = currentToken(ctx);
    ctx.index += 1;

    const expression = toLineEnd(ctx);
    ctx.index += expression.length;

    const end = createEndPosFromToken(ctx.tokenizerCtx, expression[expression.length - 1]);


    return makeAstIf(ifToken.pos, end, makeExpressionAst(ctx, expression));
}

class ParseError extends Error {
    token: ParserNode
}

export function makeExpressionAst(ctx: ParserContext, tokens: ParserNode[]): AstExpression {
    console.assert(tokens.length != 0);
    let ret: AstExpression;
    const startPos = getPos(tokens[0]);
    const endPos = createEndPosFromToken(ctx.tokenizerCtx, tokens[tokens.length - 1]);
    if (tokens.length == 1) {
        const val = getContent(tokens[0]);
        if (val.match(/^\d+$/)) {
            ret = makeAstValue(startPos, endPos, Number(val));
        } else if (val.match(/^[^\d]/)) {
            ret = makeAstIdentifier(startPos, endPos, val);
        } else {
            const error = new ParseError('illegal identifier');
            error.token = tokens[0];
            throw error;
        }
    } else {
        const binaryIndex = toToken(tokens, binaryoperators);
        const tokenContent = getContent(tokens[0]);
        if (binaryIndex.tokenIndex != -1) {
            ret = makeAstBinary(startPos, endPos,
                getContent(binaryIndex.stopAt as ParserNode) as BinaryOperator,
                makeExpressionAst(ctx, tokens.slice(0, binaryIndex.tokenIndex)),
                makeExpressionAst(ctx, tokens.slice(binaryIndex.tokenIndex + 1)),
            );
        } else if (unaryOperators.indexOf(tokenContent as UnaryOperator) != -1 && tokens.length == 2) {
            ret = makeAstUnary(startPos, endPos,
                tokenContent as UnaryOperator,
                makeExpressionAst(ctx, tokens.slice(1)));
        } else if ('nearest' == tokenContent) {
            const secondTokenContent = getContent(tokens[1]);
            if (objectType.indexOf(secondTokenContent) !== -1) {
                ret = makeAstCall(startPos, endPos, makeAstIdentifier(startPos, createEndPosFromToken(ctx.tokenizerCtx, tokens[0]), tokenContent),
                    [makeAstIdentifier(getPos(tokens[1]), createEndPosFromToken(ctx.tokenizerCtx, tokens[1]), secondTokenContent)]
                );
            } else {
                const error = new ParseError('illegal expression');
                error.token = tokens[1];
                throw error;
            }
        } else {
            const error = new ParseError('illegal expression');
            error.token = tokens[0];
            throw error;
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

    'step',
    'jump',
    'pickup',
    'drop',

    'if',
    'endif',

    'mem1',
    'mem2',
    'mem3',
    'mem4',
];

const objectType = [
    'datacube',
]

export function makeAst(ctx: ParserContext): Ast[] {
    const container = [] as Ast[];
    const tokens = ctx.tokens;
    console.log('makeAst', ctx.index, tokens.length);
    while (ctx.index < tokens.length) {
        const token = currentToken(ctx);
        const currentLineTokens = toLineEnd(ctx);

        console.log('currentLineTokens', currentLineTokens);

        const tokenContent = getContent(token);
        const secondTokenContent = getContent(currentLineTokens[1]);

        if (currentLineTokens.length == 2 && labelMaker == secondTokenContent) {
            container.push(makeAstLabel(currentLineTokens[0].pos, currentLineTokens[1].pos, currentLineTokens[0].content));
            ctx.index += 2;
        } else if ('if' == tokenContent) {
            // make if ast
            container.push(makeAstIfAst(ctx));
        } else {
            container.push(makeExpressionAst(ctx, currentLineTokens));
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
    if ('content' in end) {
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
