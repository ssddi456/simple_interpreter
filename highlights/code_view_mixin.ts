import { Ast, JumpTable, makeAst, makeParserContext, makeJumpTable, JumpInfo, IfInfo } from "../parser/parser_with_jump";
import { TokenizerContext, Token, makeTokenizerContext, tokenize } from "../parser/tokenizer";
import { default as Vue, ComponentOptions, } from 'vue/types';

import { LineInfo, makeLineInfo, tokensToLines } from "../printer/printer";
import { walk } from "../walker/walker_with_jump";
import { ContextMgrMixin } from "./context_mgr_mixin";

export interface CodeViewMixinData {
    lines: Token[][];
    astInfo: ReturnType<typeof findNodeByOffset>;
    originLines: LineInfo[];
    mapLineLength: number;
}

export interface CodeViewMixinMethods {
    loadCode(code: string): { ctx: TokenizerContext, tokens: Token[] };
    showNodeInfo(this: CodeViewMixin, node: Token): void;
    removeAllHighlightLine(this: CodeViewMixin): void;
    showAstRange(this: CodeViewMixin, ast: Ast, dontRemove: boolean): void;
    astToString(this: CodeViewMixin, ast: Ast): string;
    highlights(this: CodeViewMixin, linkInfo: JumpInfo | IfInfo): void;
}

export type CodeViewMixin = CodeViewMixinData & CodeViewMixinMethods & ContextMgrMixin & Vue;

export const code_view_mixin: ComponentOptions<CodeViewMixin> = {
    data() {
        return {
            lines: [],
            astInfo: [],
            originLines: [],
            mapLineLength: 0,
        };
    },
    methods: {
        loadCode(code: string) {

            const ctx = makeTokenizerContext(code);
            const tokens = tokenize(ctx);

            this.lines = tokensToLines(tokens);
            this.originLines = makeLineInfo(code);
            this.mapLineLength = Math.max(...this.originLines.map(function (lineInfo) {
                return lineInfo.length;
            }));

            return {
                ctx,
                tokens,
            };
        },
        showNodeInfo(node: Token) {
            const ast = findNodeByOffset(this.infos.ast, node.pos.offset);
            this.astInfo = ast;
        },
        removeAllHighlightLine() {
            const originLines = this.originLines;
            for (let i = 0; i < originLines.length; i++) {
                const element = originLines[i];
                removeHighlightLine(element);
            }
        },
        showAstRange(ast: Ast, dontRemove = false) {
            const originLines = this.originLines;
            for (let i = 0; i < originLines.length; i++) {
                const element = originLines[i];
                if (i > ast.start.line && i < ast.end.line) {
                    addHighlightLine(element, 0);
                } else if (i < ast.start.line || i > ast.end.line) {
                    dontRemove || removeHighlightLine(element);
                } else {
                    if (ast.start.line == ast.end.line) {
                        if (i == ast.start.line) {
                            addHighlightLine(element, ast.start.row, ast.end.row);
                        }
                    } else {
                        if (i == ast.start.line) {
                            addHighlightLine(element, ast.start.row);
                        } else if (i == ast.end.line) {
                            addHighlightLine(element, 0, ast.end.row);
                        }
                    }
                }
            }
        },
        astToString(ast: Ast) {
            let ret = ast.type;
            switch (ast.type) {
                case 'value':
                    ret += '(' + ast.value + ')';
                    break;
                case 'identifier':
                    ret += '<' + ast.name + '>';
                    break;
                case 'call':
                    ret += '<' + ast.name + '>';
                    break;
                case 'binary':
                    ret += ': ' + ast.operator;
                    break;
                default:
                    break;
            }
            return ret;
        },
        highlights(linkInfo: JumpInfo | IfInfo) {
            this.removeAllHighlightLine();
            'if' in linkInfo && this.showAstRange(linkInfo.if, true);
            'else' in linkInfo && this.showAstRange(linkInfo.else!, true);
            'endif' in linkInfo && this.showAstRange(linkInfo.endif, true);
            'jump' in linkInfo && this.showAstRange(linkInfo.jump, true);
            'label' in linkInfo && this.showAstRange(linkInfo.label, true);
        },
    }
}

function findNodeByOffset(ast: Ast[], offset: number): Ast[] {
    let target: Ast[] = [];
    walk(ast, function (element) {
        const start = element.start.offset;
        const end = element.end.offset;
        if (start > offset || end < offset) {
            return false;
        }
        target.push(element);
    });
    return target;
}

function addHighlightLine(line: LineInfo, start: number, end?: number) {
    line.highlightRange = [start, (end || line.length) - start];
}

function removeHighlightLine(line: LineInfo) {
    line.highlightRange = undefined;
}
