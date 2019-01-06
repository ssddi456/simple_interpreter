
import { loadSevenBHContext, SevenBHMapMaker, SevenBHObject, makeInterpreterContext, SevenBHContext, InterpreterContext, makeSevenBHContext } from "../interpreter/interpreter_with_jump";
import { Ast, JumpTable, makeAst, makeParserContext, makeJumpTable } from "../parser/parser_with_jump";
import { TokenizerContext, Token } from "../parser/tokenizer";
import { interpreter } from "../interpreter/interpreter_with_jump";
import { default as Vue, ComponentOptions, } from 'vue/types';
import { LevelMgrData, LevelMgrMethods } from "./level_mgr_mixin";

export interface ContextMgrMixinData {
    infos: {
        ast: Ast[],
        jumpTable: JumpTable,
    };
    sevenBHContext: SevenBHContext;
    interpreterContext: InterpreterContext
}

export interface ContextMgrMixinMethods {
    makeContextInfo(ctx: TokenizerContext, tokens: Token[]): void;
    isFinish(this: ContextMgrMixin): boolean;
    reload(this: ContextMgrMixin): void;
    getCellClass(this: ContextMgrMixin): void;
    getCellContent(this: ContextMgrMixin): void;
    tick(this: ContextMgrMixin): void;
}

export type ContextMgrMixin = ContextMgrMixinData & ContextMgrMixinMethods & LevelMgrData & LevelMgrMethods & Vue;

export const context_mgr_mixin: ComponentOptions<ContextMgrMixin> = {
    data() {
        return {
            infos: {
                ast: [] as Ast[],
                jumpTable: {} as JumpTable,
            },
            sevenBHContext: makeSevenBHContext(1, 1),
            interpreterContext: null,
        };
    },
    methods: {
        makeContextInfo(ctx: TokenizerContext, tokens: Token[]) {
            const infos = {
                ast: [] as Ast[],
                jumpTable: {} as JumpTable,
            };
            try {
                const parserContext = makeParserContext(ctx, tokens);
                const ast = makeAst(parserContext);
                infos.ast = ast;
                infos.jumpTable = makeJumpTable(ast);
            } catch (error) {
                console.log(error);
                error.token.error = 1;
            }
            this.infos = infos;
        },
        isFinish() {
            console.log('is finish ', this.interpreterContext.tokenIndex >= this.infos.ast.length);
            return this.interpreterContext.tokenIndex >= this.infos.ast.length;
        },
        reload() {
            this.sevenBHContext = loadSevenBHContext(this.currentLevel);
            this.interpreterContext = makeInterpreterContext();
        },
        
        tick() {
            interpreter(this.infos.ast, this.interpreterContext, this.sevenBHContext, this.infos.jumpTable);
        },
    }
};

