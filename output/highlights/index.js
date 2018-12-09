define(["require", "exports", "vue/types", "../parser/tokenizer", "../printer/printer", "../walker/walker_with_jump", "./player_mixin", "./context_mgr_mixin", "./edit_mixin"], function (require, exports, types_1, tokenizer_1, printer_1, walker_with_jump_1, player_mixin_1, context_mgr_mixin_1, edit_mixin_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var contents = ["a:\nb:\nmem1 = nearest datacube\nstep mem1\nif c == datacube and\n  nw != datacube and\n  w != datacube:\n    step nw,w,sw,n,s,ne,e,se\n    jump b\nendif\npickup mem1\nc:\nif w != datacube and\n  e != datacube and\n  c != datacube and\n  nw != datacube and\n  myitem == datacube:\n    drop\n    jump a\nendif\nstep nw,w,sw,n,s,ne,e,se\njump c\n",
        "if c == datacube and\n  nw != datacube:\n    step nw,w,sw,n,s,ne,e,se\n    jump b\nendif\n", "step s\nstep s\nstep s\nstep s\npickup c\nstep s\ndrop\n",
        "a:\nif c != datacube:\n    step s\n    jump a\nendif\npickup c\nstep s\ndrop\n"];
    var content = contents[3];
    var originLines = printer_1.makeLineInfo(content);
    console.log(originLines);
    var ctx = tokenizer_1.makeTokenizerContext(content);
    var tokens = tokenizer_1.tokenize(ctx);
    var lines = printer_1.tokensToLines(tokens);
    ;
    var config = {
        el: '#main',
        mixins: [context_mgr_mixin_1.makeContextMgr(ctx, tokens), player_mixin_1.player_mixin, edit_mixin_1.edit_mixin],
        data: {
            lines: lines,
            astInfo: [],
            originLines: originLines,
            mapLineLength: originLines.reduce(function (max, line) {
                return Math.max(max, line.length);
            }, 0),
        },
        methods: {
            showNodeInfo: function (node) {
                var ast = findNodeByPos(this.infos.ast, node.pos.offset);
                this.astInfo = ast;
            },
            removeAllHighlightLine: function () {
                for (var i = 0; i < originLines.length; i++) {
                    var element = originLines[i];
                    removeHighlightLine(element);
                }
            },
            showAstRange: function (ast, dontRemove) {
                if (dontRemove === void 0) { dontRemove = false; }
                for (var i = 0; i < originLines.length; i++) {
                    var element = originLines[i];
                    if (i > ast.start.line && i < ast.end.line) {
                        addHighlightLine(element, 0);
                    }
                    else if (i < ast.start.line || i > ast.end.line) {
                        dontRemove || removeHighlightLine(element);
                    }
                    else {
                        if (ast.start.line == ast.end.line) {
                            if (i == ast.start.line) {
                                addHighlightLine(element, ast.start.row, ast.end.row);
                            }
                        }
                        else {
                            if (i == ast.start.line) {
                                addHighlightLine(element, ast.start.row);
                            }
                            else if (i == ast.end.line) {
                                addHighlightLine(element, 0, ast.end.row);
                            }
                        }
                    }
                }
            },
            astToString: function (ast) {
                var ret = ast.type;
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
            highlights: function (linkInfo) {
                this.removeAllHighlightLine();
                'if' in linkInfo && this.showAstRange(linkInfo.if, true);
                'else' in linkInfo && this.showAstRange(linkInfo.else, true);
                'endif' in linkInfo && this.showAstRange(linkInfo.endif, true);
                'jump' in linkInfo && this.showAstRange(linkInfo.jump, true);
                'label' in linkInfo && this.showAstRange(linkInfo.label, true);
            },
        }
    };
    new types_1.default(config);
    function findNodeByPos(ast, offset) {
        var target = [];
        walker_with_jump_1.walk(ast, function (element) {
            var start = element.start.offset;
            var end = element.end.offset;
            if (start > offset || end < offset) {
                return false;
            }
            target.push(element);
        });
        return target;
    }
    function addHighlightLine(line, start, end) {
        line.highlightRange = [start, (end || line.length) - start];
    }
    function removeHighlightLine(line) {
        line.highlightRange = undefined;
    }
});
