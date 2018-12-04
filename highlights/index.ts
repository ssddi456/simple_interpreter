import { tokenize, makeTokenizerContext, Token } from "../parser/tokenizer";
import { tokensToLines, makeLineInfo, LineInfo } from "../printer/printer";
import { Ast, JumpInfo, IfInfo } from "../parser/parser_with_jump";
import { walk } from "../walker/walker_with_jump";
import { interpreter } from "../interpreter/interpreter_with_jump";
import { player_mixin } from "./player_mixin";
import { makeContextMgr } from "./context_mgr_mixin";
import { edit_mixin } from "./edit_mixin";

const contents = [`a:
b:
mem1 = nearest datacube
step mem1
if c == datacube and
  nw != datacube and
  w != datacube:
    step nw,w,sw,n,s,ne,e,se
    jump b
endif
pickup mem1
c:
if w != datacube and
  e != datacube and
  c != datacube and
  nw != datacube and
  myitem == datacube:
    drop
    jump a
endif
step nw,w,sw,n,s,ne,e,se
jump c
`,
    `if c == datacube and
  nw != datacube:
    step nw,w,sw,n,s,ne,e,se
    jump b
endif
`, `step s
step s
step s
step s
pickup c
step s
drop
`,
`a:
if c != datacube:
    step s
    jump a
pickup c
step s
drop
`];



const content = contents[2];
const originLines = makeLineInfo(content);
console.log(originLines);
const ctx = makeTokenizerContext(content);
const tokens = tokenize(ctx);
const lines = tokensToLines(tokens);


new Vue({
    el: '#main',
    mixins: [makeContextMgr(ctx, tokens), player_mixin, edit_mixin],
    data: {
        lines: lines,
        astInfo: [],
        originLines: originLines,
        mapLineLength: originLines.reduce(function (max, line) {
            return Math.max(max, line.length);
        }, 0),
        jumpTable: {},
    },
    methods: {
        showNodeInfo: function (node: Token) {
            const ast = findNodeByPos(this.infos.ast, node.pos.offset);
            this.astInfo = ast;
        },
        removeAllHighlightLine() {
            for (let i = 0; i < originLines.length; i++) {
                const element = originLines[i];
                removeHighlightLine(element);
            }
        },
        showAstRange: function (ast: Ast, dontRemove = false) {
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
        astToString: function (ast: Ast) {
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
            'else' in linkInfo && this.showAstRange(linkInfo.else, true);
            'endif' in linkInfo && this.showAstRange(linkInfo.endif, true);
            'jump' in linkInfo && this.showAstRange(linkInfo.jump, true);
            'label' in linkInfo && this.showAstRange(linkInfo.label, true);
        },
        tick() {
            interpreter(this.infos.ast, this.interpreterContext, this.sevenBHContext, this.jumpTable);
        },
    }
});

function findNodeByPos(ast: Ast[], offset: number): Ast[] {
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
