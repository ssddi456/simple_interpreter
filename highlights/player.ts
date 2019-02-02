import { Vue, Component, Prop, Emit } from 'vue-property-decorator';
import util_mixins from './util_mixins';
import { context_mgr_mixin } from './context_mgr_mixin';
import { player_mixin } from './player_mixin';
import { code_view_mixin } from './code_view_mixin';
import { level_mgr_mixin } from './level_mgr_mixin';


@Component
export default class extends Vue.extend({
    mixins: [context_mgr_mixin, player_mixin, code_view_mixin, util_mixins, level_mgr_mixin],
    template: /* template */`
        <div class="container-fluid">
            <div class="col-sm-6">
                <div class="row cell-map col-sm-12">
                    <div class="cell-line" v-for="row in sevenBHContext.map">
                        <div :class="['cell', getCellClass(cell)]" v-for="cell in row">
                            <div v-if="cell.type == SevenBHMapMaker.floor">
                                <div v-for="item in cell.has">
                                    <div :class="getCellClass(item)">{{getCellContent(item)}}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row col-sm-12">
                    <div class="form form-group">
                        <div class="btn-toolbar controls">

                            <div class="btn-group">
                                <button class="btn btn-default" @click="next">next</button>
                                <button class="btn btn-default" @click="play">play</button>
                                <button class="btn btn-default" @click="pause">pause</button>
                                <button class="btn btn-default" @click="restart">restart</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-6">
                <div class="links">
                    <div v-for="ifInfo in infos.jumpTable.ifMap" @mouseenter="highlights(ifInfo)">
                        <div v-if="ifInfo.else">
                            <div class="if-link" :style="{
                                    left: (ifInfo.if.start.row * 7) + 'px', 
                                    top: ((ifInfo.if.start.line + 1) * 38 - 5) + 'px',
                                    height: ((ifInfo.else.start.line - ifInfo.if.start.line - 1) * 38) + 'px'
                                }"></div>
                            <div class="if-link" :style="{
                                    left: (ifInfo.else.start.row * 7) + 'px', 
                                    top: ((ifInfo.else.start.line + 1) * 38 - 5) + 'px',
                                    height:((ifInfo.endif.start.line - ifInfo.else.start.line - 1) * 38) + 'px'
                                }"></div>
                        </div>
                        <div v-if="!ifInfo.else">
                            <div class="if-link" :style="{
                                    left: (ifInfo.if.start.row * 7) + 'px', 
                                    top: ((ifInfo.if.start.line + 1) * 38 - 5) + 'px',
                                    height: ((ifInfo.endif.start.line - ifInfo.if.start.line - 1) * 38) + 'px'
                                }"></div>
                        </div>
                    </div>
                    <div v-for="(jumpInfo, i) in infos.jumpTable.jumpMap" @mouseenter="highlights(jumpInfo)">
                        <div :class="['if-link', 'link-color-' + (i+1)]" :style="{
                                left: ((mapLineLength + 4 * (i + 1) ) * 7) + 'px', 
                                top: ((Math.min(jumpInfo.jump.start.line, jumpInfo.label.start.line)) * 38 + 14) + 'px',
                                height: ((Math.abs(jumpInfo.jump.start.line - jumpInfo.label.start.line)) * 38 + 4)  + 'px'
                            }"></div>
                        <div :class="['if-link', 'link-color-' + (i+1)]" :style="{
                                left: ((jumpInfo.jump.end.row + 2)* 7) + 'px', 
                                top: (jumpInfo.jump.end.line * 38 + 14) + 'px',
                                width: ((Math.abs(jumpInfo.jump.end.row - mapLineLength) + 4 * (i + 1) - 2) * 7) + 'px'
                            }"></div>
                        <div :class="['if-link', 'link-color-' + (i+1)]" :style="{
                                left: ((jumpInfo.label.end.row + 2)* 7) + 'px', 
                                top: (jumpInfo.label.end.line * 38 + 14) + 'px',
                                width: ((Math.abs(jumpInfo.label.end.row - mapLineLength) + 4 * (i + 1) - 2) * 7) + 'px'
                            }"></div>
                    </div>

                </div>

                <div class="lines">
                    <div v-for="(line, idx) in lines" class="line">
                        <div class="line-indicator" :class='[idx == interpreterContext.line && "active"]'>&nbsp;</div>
                        <div class="line-number">{{ idx }}</div>
                        <div class="line-content">
                            &nbsp;
                            <div v-for="token in line" :class='["token", token.error && "error"]' :style="{left: (token.pos.row * 7) + 'px'}"
                                @click="showNodeInfo(token)" v-html="token.content">
                            </div>
                            <div v-if="originLines[idx].highlightRange !== undefined" :class='["token", "ast-range"]'
                                :style="{left: (originLines[idx].highlightRange[0] * 7) + 'px', 
                        width: (originLines[idx].highlightRange[1] * 7) + 'px'}">&nbsp;</div>
                        </div>
                    </div>
                </div>
            </div>
        </div> `
}) {


}