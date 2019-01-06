import { edit_mixin } from './edit_mixin';
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';
import util_mixins from './util_mixins';


@Component
export default class extends Vue.extend({
    mixins: [edit_mixin, util_mixins],
    template: /* template */`
    <div>
        <div class="container-fluid">
            <div class="col-sm-12">
                <div class="form">
                    <div class="form-group">
                        <div class="form-inline">
                            <div class="input-group">
                                <label>width</label>
                                <input type="text" class="form-control" v-model="width">
                            </div>
                            <div class="input-group">
                                <label>height</label>
                                <input type="text" class="form-control" v-model="height">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="btn-group">
                            <div class="btn btn-default" :class="{'active': pointerMode == PointerMode.pointer}" @click="setPointer">pointer</div>
                        </div>
                        <div class="btn-group">
                            <div :class='["btn btn-default", (brush == type && pointerMode == PointerMode.brush) && "active"]'
                                v-for="(type, key) in brushTypes" @click="setBrush(type)" v-if="typeof type== 'number'">{{key}}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-sm-6">
                <div class="row">
                    <div class="cell-map col-sm-12" @mousedown="startBrush" @mouseup="endBrush">
                        <div class="cell-line" v-for="row in editSevenBHContext.map">
                            <div :class="['cell', getCellClass(cell)]" v-for="cell in row" @click="doClick(cell)"
                                @mousemove="doBrush(cell, true)"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-sm-6">
                <pre v-html="mapInfo()"></pre>
            </div>
        </div>
    </div>
        `
}) {


}