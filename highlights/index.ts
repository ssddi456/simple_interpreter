import { tokenize, makeTokenizerContext } from "../parser/tokenizer";
import { tokensToLines } from "../printer/printer";
import { makeParserContext, makeAst } from "../parser/parser_with_jump";

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
        astInfo: {}
    },
    methods: {
        showNodeInfo: function (node) {
            console.log(node);
        },
    }
});


try {
    const ast = makeAst(parserContext);
} catch (error) {
    console.log(error.token);
    error.token.error = 1;
}



