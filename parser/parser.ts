import { UnaryOperator, BinaryOperator, makeTokenizerContext, tokenize, Range, Pos, Token, TokenizerContext, getPosAtOffset } from "./tokenizer";

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

export type AstExpression = AstUnary | AstBinary | AstTrinary | AstValue | AstIdentifier;

export type Ast = AstExpression | AstLabel | AstComment;

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

export function toToken(ctx: ParserContext, stopTokens: string[]): Token[] {
    const start = ctx.index;
    let end = start;
    while (end < ctx.tokens.length) {
        const token = ctx.tokens[end].content;
        const stopAtIndex = stopTokens.indexOf(token);
        if (stopAtIndex !== -1) {
            break;
        }
        end++;
    }
    return ctx.tokens.slice(start, end);
}
export function currentToken(ctx: ParserContext): Token {
    return ctx.tokens[ctx.index];
}
export function makeAstIfAst(ctx: ParserContext): AstIf {
    const ifToken = currentToken(ctx);
    ctx.index += ;
    const expression = toLineEnd(ctx);
    ctx.index += expression.length + 1;

    const doTokens = toLineEnd(ctx);
    const end = createEndPosFromToken(ctx.tokenizerCtx, doTokens[doTokens.length - 1]);

    const doBlock = makeAstBlock(doTokens[0].pos, end, []);
    makeAst(ctx, doBlock);

    return makeAstIf(ifToken.pos, end, makeExpressionAst(ctx, expression), doBlock);
}


export function makeExpressionAst(ctx: ParserContext, tokens: Token[]): AstExpression {

}


export function makeAst(ctx: ParserContext, root: AstBlock): AstBlock {
    const container = root.children;
    const tokens = ctx.tokens;
    while (ctx.index < tokens.length) {
        const token = tokens[ctx.index];
        switch (token.content) {
            case 'if':
                // make if ast
                break;
            default:
                break;
        }
    }
    return root;
}

export function createEndPosFromToken(ctx: TokenizerContext, end: Token) {
    const endPos: Pos = getPosAtOffset({
        content: ctx.content,
        pos: { ...end.pos }
    }, end.pos.offset + end.content.length);

    return endPos;
}

export interface ParserContext {
    tokens: Token[];
    index: number;
    tokenizerCtx: TokenizerContext;
}

function makeParserContext(tokenizerCtx: TokenizerContext, tokens: Token[]): ParserContext {
    return {
        tokens,
        tokenizerCtx,
        index: 0
    };
}

export function parser(content: string): AstBlock {
    const ctx = makeTokenizerContext(content);
    const tokens = tokenize(ctx);

    const end = createEndPosFromToken(ctx, tokens[tokens.length - 1]);
    const parserContext = makeParserContext(ctx, tokens);

    return makeAst(parserContext, makeAstBlock(tokens[0].pos, end, []));
}
