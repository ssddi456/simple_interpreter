import { ComponentOptions, } from 'vue/types';
import * as Vue from 'vue';

import { player_mixin } from "./player_mixin";
import { context_mgr_mixin, ContextMgrMixin } from "./context_mgr_mixin";
import { edit_mixin } from "./edit_mixin";
import { CodeViewMixin, code_view_mixin } from './code_view_mixin';
import level_selector from './level_selector';
import test_components from './test_components';

interface MainVmData {

};
interface MainVmMethods {

}

type MainVm = MainVmData & MainVmMethods & ContextMgrMixin & CodeViewMixin & Vue;
const config: ComponentOptions<MainVm> = {
    el: '#main',
    mixins: [context_mgr_mixin, player_mixin, edit_mixin, code_view_mixin],
    components: {
        level_selector,
        test_components
    },
    data: {

    },
    created(this: MainVm) {


    },
    methods: {



    }
};

new (Vue as any)(config);

