import { loadSevenBHContext, SevenBHMapMaker, SevenBHObject, makeInterpreterContext } from "../interpreter/interpreter_with_jump";
import { level1 } from "../data/levels";
import { Ast, JumpTable, makeAst, makeParserContext, makeJumpTable } from "../parser/parser_with_jump";
import { TokenizerContext, Token } from "../parser/tokenizer";



export function makeContextMgr(ctx: TokenizerContext, tokens: Token[]) {

    const parserContext = makeParserContext(ctx, tokens);

    const infos = {
        ast: [] as Ast[],
        jumpTable: {} as JumpTable,
    };
    try {
        const ast = makeAst(parserContext);
        infos.ast = ast;
        infos.jumpTable = makeJumpTable(ast);
    } catch (error) {
        console.log(error);
        error.token.error = 1;
    }

    function makeData() {
        return {
            infos,
            currentBush: SevenBHMapMaker.floor,
            SevenBHMapMaker,
            sevenBHContext: loadSevenBHContext(level1),
            interpreterContext: makeInterpreterContext(),
        };
    }
    type ContextMgrData = ReturnType<typeof makeData>;
    
    const context_mgr_mixin = {
        data: makeData,
        methods: {
            isFinish(this: ContextMgrData) {
                console.log('is finish ', this.interpreterContext.tokenIndex >= this.infos.ast.length);
                return this.interpreterContext.tokenIndex >= this.infos.ast.length;
            },
            reload() {
                this.sevenBHContext = loadSevenBHContext(level1);
                this.interpreterContext = makeInterpreterContext();
            },
            getCellClass(cell: SevenBHObject) {
                if (cell.type == SevenBHMapMaker.datacube) {
                    return SevenBHMapMaker[SevenBHMapMaker.datacube];
                } else if (cell.type == SevenBHMapMaker.worker) {
                    if (!cell.holds) {
                        return SevenBHMapMaker[SevenBHMapMaker.worker];
                    } else {
                        return 'worker-with-datacube';
                    }
                }

                return SevenBHMapMaker[cell.type];
            },
            getCellContent(cell: SevenBHObject) {
                if (cell.type == SevenBHMapMaker.datacube) {
                    return cell.value;
                } else if (cell.type == SevenBHMapMaker.worker) {
                    if (cell.holds) {
                        return cell.holds.value;
                    }
                }
            },
        }
    };

    return context_mgr_mixin;
}
