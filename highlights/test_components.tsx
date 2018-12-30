import { Vue, Component, Prop } from 'vue-property-decorator';
import { CreateElement } from 'vue/types';

@Component
export default class extends Vue {
    @Prop({ default: 'some sort of data'})
    data: string;
    render(h: CreateElement) {
        return (
            <div>{this.data}</div>
        );
    }
}