
export interface Pos {
    line: number;
    row: number;
    offset: number;
}

export interface Range {
    start: Pos;
    end: Pos;
}

export interface Token {
    content: string;
    pos: Pos;
}

export interface TokenizerContext {
    pos: Pos;
    content: string;
}


export type UnaryOperator = '!' | '-';
export const unaryOperators: UnaryOperator[] = ['!', '-'];


export type CaculateOperator = '+' | '-' | '*' | '/' | '&' | '|';
export const caculateOperators: CaculateOperator[] = ['+', '-', '*', '/', '&', '|'];
export type ConpareOperator = '!=' | '!==' | '==' | '<=' | '<' | '>' | '>=';
export const conpareOperators: ConpareOperator[] = ['!=', '!==', '==', '<=', '<', '>', '>='];
export type LogicOperator = '||' | '&&';
export const logicOperators: LogicOperator[] = ['||', '&&'];

export type BinaryOperator = CaculateOperator | ConpareOperator | LogicOperator;;
export const binaryoperators: BinaryOperator[] = [...caculateOperators, ...conpareOperators, ...logicOperators];

export type TrinaryOperator = '?' | ':';
export const trinaryOperators: TrinaryOperator[] = ['?', ':'];
export const labelMake = ':';

export const callOperator = '(';
export const callEnd = ')';
export const comma = ',';
export const whiteSpace = ' ';
export const comment = '//';

export const operators = [...binaryoperators, ...unaryOperators, ...trinaryOperators, callOperator, comma, callEnd, comment, whiteSpace];

export const lineEnd = '\n';

export function makeTokenizerContext(content: string): TokenizerContext {
    return {
        content,
        pos: {
            line: 0,
            row: 0,
            offset: 0,
        }
    }
}
export function subContext(ctx: TokenizerContext): TokenizerContext {
    return {
        content: ctx.content,
        pos: {
            line: ctx.pos.line,
            row: ctx.pos.row,
            offset: ctx.pos.offset,
        }
    }
}

export function skipWhiteSpace(ctx) {
    const content = ctx.content;
    const pos = ctx.pos;
    const len = content.length
    for (let i = pos.offset; i < len; i++) {
        const element = content[i];
        if (element == whiteSpace) {
            pos.offset += 1;
            pos.row += 1;
        } else if (element == lineEnd) {
            pos.offset += 1;
            pos.line += 1;
            pos.row = 0;
        } else {
            return;
        }
    }
}

export function getToken(ctx: TokenizerContext, stopTokens: string[] = operators) {
    const content = ctx.content;
    const len = content.length;
    const nextLineEnd = content.indexOf(lineEnd, ctx.pos.offset);
    let indexOffset = nextLineEnd !== -1 ? nextLineEnd : len;
    let stopAt;
    for (let i = 0; i < stopTokens.length; i++) {
        const element = stopTokens[i];
        const idx = content.indexOf(element, ctx.pos.offset);
        if (idx !== -1) {
            if (idx < indexOffset) {
                indexOffset = idx;
                stopAt = element;
            } if (idx == indexOffset && element.length > stopAt.length) {
                stopAt = element;
            }
        }
    }

    return {
        indexOffset,
        token: getText(ctx.content, ctx.pos, indexOffset),
        stopAt
    };
}

export function toOffset(ctx: TokenizerContext, offset: number) {
    const content = ctx.content;
    offset = Math.min(offset, content.length);;
    let pos = ctx.pos;

    let nextLineEnd = content.slice(0, offset).indexOf(lineEnd, pos.offset);
    if (nextLineEnd < offset && nextLineEnd !== -1) {
        while (nextLineEnd < offset && nextLineEnd !== -1) {
            pos.line += 1;
            pos.row = offset - nextLineEnd - 1;
            nextLineEnd = content.indexOf(lineEnd, nextLineEnd + 1);
        }
    } else {
        pos.row += offset - pos.offset;
    }
    pos.offset = offset;
}

export function addOffset(ctx: TokenizerContext, offsetAdd: number) {
    toOffset(ctx, ctx.pos.offset + offsetAdd);
}

export function getText(content: string, start: Pos | number, end: Pos | number): string {
    if (typeof start != 'number') {
        start = start.offset;
    }

    if (typeof end != 'number') {
        end = end.offset;
    }

    return content.slice(start, end);
}

export function getPosAtOffset(ctx: TokenizerContext, offset) {
    const pos: Pos = {
        ...ctx.pos
    };

    const content = ctx.content;
    const len = Math.min(content.length, offset);
    for (let i = pos.offset; i < len; i++) {
        const element = content[i];
        if (element) {
            if (element !== lineEnd) {
                pos.offset += 1;
                pos.row += 1;
            } else {
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

export function tokenize(ctx: TokenizerContext): Token[] {
    const content = ctx.content;
    const tokens: Token[] = [];
    while (ctx.pos.offset < content.length) {
        skipWhiteSpace(ctx);
        const { indexOffset, token, stopAt } = getToken(ctx);
        if (token) {
            tokens.push({
                content: token,
                pos: { ...ctx.pos }
            });
            addOffset(ctx, token.length);
        }
        if (stopAt) {
            if (stopAt !== lineEnd && stopAt !== whiteSpace) {
                tokens.push({
                    content: stopAt,
                    pos: { ...ctx.pos }
                });
                addOffset(ctx, stopAt.length);
            }
        }
    }
    return tokens;
}
