import { default as VueType, ComponentOptions, } from 'vue/types';
import * as Vue from 'vue';

import { player_mixin } from "./player_mixin";
import { context_mgr_mixin, ContextMgrMixin } from "./context_mgr_mixin";
import { edit_mixin } from "./edit_mixin";
import { CodeViewMixin, code_view_mixin } from './code_view_mixin';
import level_selector from './level_selector';
import editor from './editor';
import util_mixins from './util_mixins';
import player from './player';
import { LevelMgrMixin } from './level_mgr_mixin';

interface MainVmData {
    mainVmModes: typeof mainVmModes;
    currentMode: mainVmModes;
}

interface MainVmMethods {
    changeHandler();
}

((Vue as any) as Vue.VueConstructor).use({
    install(vue) {
        vue.mixin(vue.extend({
            beforeCreate() {
                const originalCreateElement = this.$createElement;
                this.$createElement = (tag: any, data: any, ...children: any[]) =>
                    originalCreateElement(tag, data, children);
            },
        }));
    },
});

type MainVm = MainVmData & MainVmMethods & ContextMgrMixin & CodeViewMixin & VueType;
enum mainVmModes {
    level_selector,
    player,
    editor
}
const config: ComponentOptions<MainVm> = {
    el: '#main',
    template: /** template */`
        <level_selector v-if="currentMode == mainVmModes.level_selector" @change="changeHandler"></level_selector>
        <player v-else-if="currentMode == mainVmModes.player" ref="player" />
        <editor v-else-if="currentMode == mainVmModes.editor" />
    `,
    components: {
        level_selector,
        player,
        editor
    },
    data() {
        return {
            mainVmModes,
            currentMode: mainVmModes.level_selector
        };
    },
    methods: {
        changeHandler(index: number) {
            console.log('changed', index);
            this.currentMode = mainVmModes.player;
            this.$nextTick(function(){
                (this.$refs.player as LevelMgrMixin).loadLevel(index);
            });
        }
    }
};

new (Vue as any)(config);

