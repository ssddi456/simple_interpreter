import { Vue, Component, Prop, Emit } from 'vue-property-decorator';
import { CreateElement } from 'vue/types';

@Component
export default class extends Vue {
    @Prop({ default: 'some sort of data' })
    data: string;

    someClicHandler() {
        console.log('yeah');
        this.$emit('test');
    }

    render(h: CreateElement) {
        return (
            h('div', {
                on: {
                    click: () => this.someClicHandler()
                }
            }, [this.data])
        );
    }
}