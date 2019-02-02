import { default as Vue, ComponentOptions, } from 'vue/types';
import { SevenBHLevel } from '../interpreter/interpreter_with_jump';
import { ContextMgrMixin, ContextMgrMixinData, ContextMgrMixinMethods } from './context_mgr_mixin';
import { CodeViewMixinData, CodeViewMixinMethods } from './code_view_mixin';
import levels from '../data/levels';


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
endif
pickup c
step s
drop
`];


export interface PlayStatus {
    code: string;
}

export interface LevelMgrData {
    levels: SevenBHLevel[],
    playStatuses: PlayStatus[];
    currentLevelIndex: number;
    currentLevel: SevenBHLevel;
}

export interface LevelMgrMethods {
    levelExists(n: number): void;
    loadLevel(n: number): void;
}

function makePlayStatus(): PlayStatus {
    return {
        code: ''
    };
}

export type LevelMgrMixin = LevelMgrData & LevelMgrMethods & ContextMgrMixinData & ContextMgrMixinMethods & CodeViewMixinData & CodeViewMixinMethods & Vue;

export const level_mgr_mixin: ComponentOptions<LevelMgrMixin> = {
    data() {
        return {
            levels,
            playStatuses: [{
                code: `a:
if c != datacube:
    step s
    jump a
endif
pickup c
step s
drop
`
            }],
            currentLevelIndex: -1,
            currentLevel: undefined,
        };
    },
    methods: {
        loadLevel(n: number) {
            this.currentLevelIndex = n;
            this.currentLevel = this.levels[this.currentLevelIndex];

            this.playStatuses[this.currentLevelIndex] = this.playStatuses[this.currentLevelIndex] || makePlayStatus();
            const playStatus = this.playStatuses[this.currentLevelIndex];
            const { ctx, tokens } = this.loadCode(playStatus.code);

            this.makeContextInfo(ctx, tokens);
            this.reload();
        }
    }
};

