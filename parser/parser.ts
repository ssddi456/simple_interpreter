import { UnaryOperator, BinaryOperator, makeTokenizerContext, tokenize, Range, Pos, Token, TokenizerContext, getPosAtOffset, binaryoperators, unaryOperators } from "./tokenizer";

export interface AstBase extends Range {
    type: string;
}

export interface AstBlock extends AstBase {
    type: 'block',
    children: Ast[];
}
export function makeAstBlock(start: Pos, end: Pos, children: Ast[]): AstBlock {
    return {
        type: 'block',
        children,
        start,
        end,
    };
}

export interface AstIf extends AstBase {
    type: 'if',
    expression: AstExpression;
    do: AstBlock;
    else?: AstBlock;
}
export function makeAstIf(start: Pos, end: Pos, expression: AstExpression, _do: AstBlock, _else?: AstBlock): AstIf {
    const ret: AstIf = {
        start,
        end,
        type: 'if',
        expression,
        do: _do
    };
    if (_else) {
        ret.else = _else
    }
    return ret;
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

export function makeAstIdentifier(start: Pos, end: Pos, name): AstIdentifier {
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

export type Ast = AstExpression | AstLabel | AstComment | AstIf;

export function toLineEnd(ctx: ParserContext): Token[] {
    const start = ctx.index;
    let end = start;
    const startLine = ctx.tokens[end].pos.line;
    while (end < ctx.tokens.length) {
        const token = ctx.tokens[end];
        if (token.pos.line != startLine) {
            break;
        }
        end++;
    }
    return ctx.tokens.slice(start, end);
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
    ctx.index += expression.length + 1;

    const doTokens = toLineEnd(ctx);
    const end = createEndPosFromToken(ctx.tokenizerCtx, doTokens[doTokens.length - 1]);

    const doBlock = makeAstBlock(doTokens[0].pos, end, []);
    makeAst(ctx, doBlock);

    return makeAstIf(ifToken.pos, end, makeExpressionAst(ctx, expression), doBlock);
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
            throw new Error('illegal identifier');
        }
    } else {
        const binaryIndex = toToken(tokens, binaryoperators);
        if (binaryIndex.tokenIndex != -1) {
            ret = makeAstBinary(startPos, endPos,
                getContent(binaryIndex.stopAt as ParserNode) as BinaryOperator,
                makeExpressionAst(ctx, tokens.slice(0, binaryIndex.tokenIndex)),
                makeExpressionAst(ctx, tokens.slice(binaryIndex.tokenIndex + 1)),
            );
        } else if (unaryOperators.indexOf(getContent(tokens[0]) as UnaryOperator) != -1 && tokens.length == 2) {
            ret = makeAstUnary(startPos, endPos,
                getContent(tokens[0]) as UnaryOperator,
                makeExpressionAst(ctx, tokens.slice(1)));
        } else {
            throw new Error('illegal expression');
        }
    }

    ctx.index += tokens.length;
    return ret;
}


export function makeAst(ctx: ParserContext, root: AstBlock): AstBlock {
    const container = root.children;
    const tokens = ctx.tokens;
    console.log('makeAst', ctx.index, tokens.length);
    while (ctx.index < tokens.length) {
        const token = currentToken(ctx);
        const currentLineTokens = toLineEnd(ctx);
        console.log('currentLineTokens', currentLineTokens);
        const tokenContent = getContent(token);

        if ('if' == tokenContent) {
            // make if ast
            container.push(makeAstIfAst(ctx));
        } else {
            container.push(makeExpressionAst(ctx, currentLineTokens));
        }
    }
    return root;
}
export function makeAstSubContext(context: ParserContext, subContext: Partial<ParserContext>, root: AstBlock) {
    const extendedContext = {
        ...context,
        ...subContext,
    };

    const ret = makeAst(extendedContext, root);
    context.index = extendedContext.index;
    return ret;
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

    console.log('endNodePos', endNodePos, getContentLength(end));

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

function makeParserContext(tokenizerCtx: TokenizerContext, tokens: Token[]): ParserContext {
    return {
        tokens,
        tokenizerCtx,
        index: 0,
        stopTokens: []
    };
}

export function parser(content: string): AstBlock {
    const ctx = makeTokenizerContext(content);
    const tokens = tokenize(ctx);

    const end = createEndPosFromToken(ctx, tokens[tokens.length - 1]);
    const parserContext = makeParserContext(ctx, tokens);

    return makeAst(parserContext, makeAstBlock(getPos(tokens[0]), end, []));
}
