import { default as Vue, ComponentOptions, } from 'vue/types';

import { SevenBHMapMaker, SevenBHObject, SevenBHContext, makeSevenBHContext, SevenBHDataCube } from "../interpreter/interpreter_with_jump";
import { ContextMgrMixin } from './context_mgr_mixin';

enum PointerMode {
    pointer,
    brush,
}
enum DisplayMode {
    edit = 'edit',
    playing = 'playing',
}
export interface EditMixinData {
    mode: DisplayMode;
    pointerMode: PointerMode;
    PointerMode: typeof PointerMode;
    brush: SevenBHMapMaker;
    brushTypes: typeof SevenBHMapMaker;
    modes: DisplayMode[];
    width: number;
    height: number;
    editSevenBHContext: SevenBHContext | undefined;
    brushing: boolean;
}
export interface EditMixinMethods {
    init(this: EditMixin): void;
    mapInfo(this: EditMixin): void;
    toggleMode(this: EditMixin): void;
    setPointer(this: EditMixin): void;
    setBrush(this: EditMixin, type: SevenBHMapMaker): void;
    doClick(this: EditMixin, item: SevenBHObject): void;
    doBrush(this: EditMixin, item: SevenBHObject): void;
    showItem(this: EditMixin, item: SevenBHObject): void;
    startBrush(this: EditMixin): void;
    endBrush(this: EditMixin): void;
    [key: string]: (this: EditMixin, ...args: any[]) => any;
}

export type EditMixin = EditMixinData & EditMixinMethods & Vue;

const edit_mixin_methods: EditMixinMethods = {
    init() {
        const newContext = makeSevenBHContext(Number(this.width), Number(this.height));
        if (this.editSevenBHContext) {
            for (let i = 0; i < newContext.map.length; i++) {
                const element = newContext.map[i];
                const oldElement = this.editSevenBHContext.map[i];
                if (element && oldElement) {
                    for (let j = 0; j < element.length; j++) {
                        const cell = element[j];
                        const oldCell = oldElement[j];
                        if (cell && oldCell) {
                            cell.type = oldCell.type;
                            if (oldCell.type == SevenBHMapMaker.datacube) {
                                (cell as SevenBHDataCube).value = oldCell.value;
                            }
                        }
                    }
                }
            }
        }
        this.editSevenBHContext = newContext;
    },
    mapInfo() {
        return JSON.stringify(this.editSevenBHContext, null, 2);
    },
    toggleMode() {
        const idx = this.modes.indexOf(this.mode);
        if (idx >= this.modes.length - 1) {
            this.mode = this.modes[0];
        } else {
            this.mode = this.modes[idx + 1];
        }
    },
    setPointer() {
        this.pointerMode = PointerMode.pointer;
    },
    setBrush(type: SevenBHMapMaker) {
        this.pointerMode = PointerMode.brush;
        this.brush = type;
    },
    doClick(item: SevenBHObject) {
        if (this.pointerMode == PointerMode.pointer) {
            this.showItem(item);
        } else {
            this.doBrush(item)
        }
    },
    showItem(item: SevenBHObject) {

    },
    startBrush() {
        if (this.pointerMode == PointerMode.brush) {
            this.brushing = true;
        }
    },
    endBrush() {
        this.brushing = false;
    },
    doBrush(item: SevenBHObject, isMove = false) {
        if (isMove) {
            if (this.brushing) {
                item.type = this.brush;
            }
        } else if (this.pointerMode == PointerMode.brush) {
            item.type = this.brush;
        }
    }
};

export const edit_mixin: ComponentOptions<EditMixin> = {
    data(): EditMixinData {
        return {
            mode: DisplayMode.playing,
            pointerMode: PointerMode.pointer,
            PointerMode: PointerMode,
            brush: SevenBHMapMaker.floor,
            brushTypes: SevenBHMapMaker,
            modes: [DisplayMode.edit, DisplayMode.playing],
            width: 10,
            height: 10,
            editSevenBHContext: undefined,
            brushing: false,
        };
    },
    created() {
        this.init();
    },
    methods: edit_mixin_methods,
    watch: {
        width() {
            this.init();
        },
        height() {
            this.init();
        }
    }
}