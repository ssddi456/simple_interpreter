import { Token } from "../parser/tokenizer";
import { Ast } from "../parser/parser_with_jump";

export function tokensToLines(tokens: Token[]) {
    const lines = [] as Token[][];
    let line = [] as Token[];
    var lineIndex = 0;
    for (let i = 0; i < tokens.length; i++) {
        const element = tokens[i] as Token & {error: 0 | 1, index:number};
        element.error = 0;
        element.index = i;
        if (element.pos.line != lineIndex) {
            lineIndex = element.pos.line;
            lines.push(line);
            line = [element];
        } else {
            line.push(element);
        }
    }
    if (line.length) {
        lines.push(line);
    }
    return lines;
}

export function astTreeToLines( ast: Ast[]): Ast[]{
    const lines = [] as Ast[];
    // so i should find a way to flatten ast tree
    return lines;
}

export interface LineInfo {
    length: number;
    startOffset: number;
    endOffset: number;
    highlightRange: [number, number] | undefined;
};
export function makeLineInfo(content: string): LineInfo[] {
    const ret: LineInfo[] = [];
    let index = 0;

    while (index != -1){
        const nextLineEnd = content.indexOf('\n', index);
        if(nextLineEnd != -1) {
            ret.push({
                length: nextLineEnd  - index,
                startOffset: index,
                endOffset: nextLineEnd,
                highlightRange: undefined,
            });
        } else {
            ret.push({
                length: content.length - index,
                startOffset: index,
                endOffset: content.length,
                highlightRange: undefined,
            });
            return ret;
        }
        index = nextLineEnd + 1;
    }
    return ret;
}