import { tokenize, makeTokenizerContext, Pos, Token } from "../parser/tokenizer";
import { tokensToLines } from "../printer/printer";
import { makeParserContext, makeAst, Ast } from "../parser/parser_with_jump";
import { walk } from "../walker/walker_with_jump";

const content = `a:
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
`;

const ctx = makeTokenizerContext(content);

const tokens = tokenize(ctx);

const lines = tokensToLines(tokens);

const parserContext = makeParserContext(ctx, tokens);

console.log(lines);


const mainVm = new Vue({
    el: '#main',
    data: {
        lines: lines,
        ast: [],
    },
    methods: {
        showNodeInfo: function (node: Token) {
            // console.log(node);
            const ast = findNodeByPos(this.ast, node.pos.offset);
            console.log(ast.map(x => x.type).join('->'));
        },
    }
});


try {
    const ast = makeAst(parserContext);
    mainVm.ast = ast;
} catch (error) {
    console.log(error);
    error.token.error = 1;
}

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

