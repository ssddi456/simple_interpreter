import { default as Vue, CreateElement, } from 'vue/types';
import levels from '../data/levels';
import { SevenBHLevel } from '../interpreter/interpreter_with_jump';


interface LevelSelectorData {
    levels: SevenBHLevel[];
}

interface LevelSelectorMethods {
    selectLevel(n: number): void
}

type LevelSelector = LevelSelectorData & LevelSelectorMethods & Vue;

export default {
    data() {
        return {
            levels,
        }
    },
    methods: {
        selectLevel(n: number) {
            console.log(arguments);

            this.emit('change', n);
        }
    },
    render(this: LevelSelector, h: CreateElement) {
        return (
            <div if={this.levels.length}>
                {this.levels.map((element, idx) =>
                    <span onClick={this.selectLevel}>{(idx + 1) + '.level name'}</span>
                )}
            </div>
        );
    },
}