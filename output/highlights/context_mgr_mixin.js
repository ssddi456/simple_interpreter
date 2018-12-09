define(["require", "exports", "../interpreter/interpreter_with_jump", "../data/levels", "../parser/parser_with_jump", "../interpreter/interpreter_with_jump"], function (require, exports, interpreter_with_jump_1, levels_1, parser_with_jump_1, interpreter_with_jump_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function makeContextMgr(ctx, tokens) {
        var parserContext = parser_with_jump_1.makeParserContext(ctx, tokens);
        var infos = {
            ast: [],
            jumpTable: {},
        };
        try {
            var ast = parser_with_jump_1.makeAst(parserContext);
            infos.ast = ast;
            infos.jumpTable = parser_with_jump_1.makeJumpTable(ast);
        }
        catch (error) {
            console.log(error);
            error.token.error = 1;
        }
        function makeData() {
            return {
                infos: infos,
                sevenBHContext: interpreter_with_jump_1.loadSevenBHContext(levels_1.level1),
                interpreterContext: interpreter_with_jump_1.makeInterpreterContext(),
            };
        }
        var context_mgr_mixin = {
            data: makeData,
            methods: {
                isFinish: function () {
                    console.log('is finish ', this.interpreterContext.tokenIndex >= this.infos.ast.length);
                    return this.interpreterContext.tokenIndex >= this.infos.ast.length;
                },
                reload: function () {
                    this.sevenBHContext = interpreter_with_jump_1.loadSevenBHContext(levels_1.level1);
                    this.interpreterContext = interpreter_with_jump_1.makeInterpreterContext();
                },
                getCellClass: function (cell) {
                    if (cell.type == interpreter_with_jump_1.SevenBHMapMaker.datacube) {
                        return interpreter_with_jump_1.SevenBHMapMaker[interpreter_with_jump_1.SevenBHMapMaker.datacube];
                    }
                    else if (cell.type == interpreter_with_jump_1.SevenBHMapMaker.worker) {
                        if (!cell.holds) {
                            return interpreter_with_jump_1.SevenBHMapMaker[interpreter_with_jump_1.SevenBHMapMaker.worker];
                        }
                        else {
                            return 'worker-with-datacube';
                        }
                    }
                    return interpreter_with_jump_1.SevenBHMapMaker[cell.type];
                },
                getCellContent: function (cell) {
                    if (cell.type == interpreter_with_jump_1.SevenBHMapMaker.datacube) {
                        return cell.value;
                    }
                    else if (cell.type == interpreter_with_jump_1.SevenBHMapMaker.worker) {
                        if (cell.holds) {
                            return cell.holds.value;
                        }
                    }
                },
                tick: function () {
                    interpreter_with_jump_2.interpreter(this.infos.ast, this.interpreterContext, this.sevenBHContext, this.infos.jumpTable);
                },
            }
        };
        return context_mgr_mixin;
    }
    exports.makeContextMgr = makeContextMgr;
});
