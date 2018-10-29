import { tokenize, makeTokenizerContext } from "../parser/tokenizer";
import { tokensToLines } from "../printer/printer";

const content = `ctx(3,2)`;

const ctx = makeTokenizerContext(content);

const tokens = tokenize(ctx);

const lines = tokensToLines(tokens);

var mainVm = new Vue({
    el: '#main',
    data: {
        lines: lines,
        astInfo: {}
    },
    methods: {
        showNodeInfo: function (node) {

        },
    }
});