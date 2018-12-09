
import { loadSevenBHContext, SevenBHMapMaker, SevenBHObject, makeInterpreterContext, SevenBHContext, InterpreterContext } from "../interpreter/interpreter_with_jump";
import { level1 } from "../data/levels";
import { Ast, JumpTable, makeAst, makeParserContext, makeJumpTable } from "../parser/parser_with_jump";
import { TokenizerContext, Token } from "../parser/tokenizer";
import { interpreter } from "../interpreter/interpreter_with_jump";
import { default as Vue, ComponentOptions, } from 'vue/types';

export interface ContextMgrMixinData {
    infos: {
        ast: Ast[],
        jumpTable:  JumpTable,
    };
    sevenBHContext: SevenBHContext;
    interpreterContext: InterpreterContext
}

export interface ContextMgrMixinMethods {
    isFinish(this: ContextMgrMixin): boolean;
    reload(this: ContextMgrMixin): void;
    getCellClass(this: ContextMgrMixin): void;
    getCellContent(this: ContextMgrMixin): void;
    tick(this: ContextMgrMixin): void;
}

export type ContextMgrMixin = ContextMgrMixinData & ContextMgrMixinMethods & Vue;


export function makeContextMgr(ctx: TokenizerContext, tokens: Token[]): ComponentOptions<ContextMgrMixin> {

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
            sevenBHContext: loadSevenBHContext(level1),
            interpreterContext: makeInterpreterContext(),
        };
    }
    
    const context_mgr_mixin: ComponentOptions<ContextMgrMixin> = {
        data: makeData,
        methods: {
            isFinish() {
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
            tick() {
                interpreter(this.infos.ast, this.interpreterContext, this.sevenBHContext, this.infos.jumpTable);
            },
        }
    };

    return context_mgr_mixin;
}
