import { Vue, Component, Prop, Emit, Mixins } from 'vue-property-decorator';
import { CreateElement } from 'vue/types';

import levels from '../data/levels';

@Component
export default class extends Vue {
    levels = levels;

    selectLevel(n: number) {
        console.log(arguments);
        this.$emit('change', n);
    }
    render(h: CreateElement) {
        return (
            <div if={this.levels.length}>
                {this.levels.map((element, idx) =>
                    h('span', {
                        on: {
                            click: (e: MouseEvent) => {
                                this.selectLevel(idx);
                            }
                        }
                    }, [`Day ${idx + 1} ${element.name}`])
                )}
            </div>
        );
    }
}