import { Token } from "../parser/tokenizer";

export function tokensToLines(tokens: Token[]) {
    const lines = [] as Token[][];
    let line = [] as Token[];
    var lineIndex = 0;
    for (let i = 0; i < tokens.length; i++) {
        const element = tokens[i] as Token & {error: 0 | 1};
        element.error = 0;
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