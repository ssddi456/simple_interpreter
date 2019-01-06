define('output/highlights/player', ['require', 'exports', 'module', "output/node_modules/vue-property-decorator/lib/vue-property-decorator.umd", "output/highlights/util_mixins", "output/highlights/context_mgr_mixin", "output/highlights/player_mixin", "output/highlights/code_view_mixin", "output/highlights/level_mgr_mixin"], function(require, exports, module) {

  "use strict";
  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var vue_property_decorator_1 = require("output/node_modules/vue-property-decorator/lib/vue-property-decorator.umd");
  var util_mixins_1 = require("output/highlights/util_mixins");
  var context_mgr_mixin_1 = require("output/highlights/context_mgr_mixin");
  var player_mixin_1 = require("output/highlights/player_mixin");
  var code_view_mixin_1 = require("output/highlights/code_view_mixin");
  var level_mgr_mixin_1 = require("output/highlights/level_mgr_mixin");
  var default_1 = /** @class */ (function (_super) {
      __extends(default_1, _super);
      function default_1() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      default_1 = __decorate([
          vue_property_decorator_1.Component
      ], default_1);
      return default_1;
  }(vue_property_decorator_1.Vue.extend({
      mixins: [context_mgr_mixin_1.context_mgr_mixin, player_mixin_1.player_mixin, code_view_mixin_1.code_view_mixin, util_mixins_1.default, level_mgr_mixin_1.level_mgr_mixin],
      template: /* template */ "\n        <div class=\"container-fluid\">\n            <div class=\"col-sm-6\">\n                <div class=\"row cell-map col-sm-12\">\n                    <div class=\"cell-line\" v-for=\"row in sevenBHContext.map\">\n                        <div :class=\"['cell', getCellClass(cell)]\" v-for=\"cell in row\">\n                            <div v-if=\"cell.type == SevenBHMapMaker.floor\">\n                                <div v-for=\"item in cell.has\">\n                                    <div :class=\"getCellClass(item)\">{{getCellContent(item)}}</div>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"row col-sm-12\">\n                    <div class=\"form form-group\">\n                        <div class=\"btn-toolbar controls\">\n\n                            <div class=\"btn-group\">\n                                <button class=\"btn btn-default\" @click=\"next\">next</button>\n                                <button class=\"btn btn-default\" @click=\"play\">play</button>\n                                <button class=\"btn btn-default\" @click=\"pause\">pause</button>\n                                <button class=\"btn btn-default\" @click=\"restart\">restart</button>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class=\"col-sm-6\">\n                <div class=\"links\">\n                    <div v-for=\"ifInfo in infos.jumpTable.ifMap\" @mouseenter=\"highlights(ifInfo)\">\n                        <div v-if=\"ifInfo.else\">\n                            <div class=\"if-link\" :style=\"{\n                                    left: (ifInfo.if.start.row * 7) + 'px', \n                                    top: ((ifInfo.if.start.line + 1) * 38 - 5) + 'px',\n                                    height: ((ifInfo.else.start.line - ifInfo.if.start.line - 1) * 38) + 'px'\n                                }\"></div>\n                            <div class=\"if-link\" :style=\"{\n                                    left: (ifInfo.else.start.row * 7) + 'px', \n                                    top: ((ifInfo.else.start.line + 1) * 38 - 5) + 'px',\n                                    height:((ifInfo.endif.start.line - ifInfo.else.start.line - 1) * 38) + 'px'\n                                }\"></div>\n                        </div>\n                        <div v-if=\"!ifInfo.else\">\n                            <div class=\"if-link\" :style=\"{\n                                    left: (ifInfo.if.start.row * 7) + 'px', \n                                    top: ((ifInfo.if.start.line + 1) * 38 - 5) + 'px',\n                                    height: ((ifInfo.endif.start.line - ifInfo.if.start.line - 1) * 38) + 'px'\n                                }\"></div>\n                        </div>\n                    </div>\n                    <div v-for=\"(jumpInfo, i) in infos.jumpTable.jumpMap\" @mouseenter=\"highlights(jumpInfo)\">\n                        <div :class=\"['if-link', 'link-color-' + (i+1)]\" :style=\"{\n                                left: ((mapLineLength + 4 * (i + 1) ) * 7) + 'px', \n                                top: ((Math.min(jumpInfo.jump.start.line, jumpInfo.label.start.line)) * 38 + 14) + 'px',\n                                height: ((Math.abs(jumpInfo.jump.start.line - jumpInfo.label.start.line)) * 38 + 4)  + 'px'\n                            }\"></div>\n                        <div :class=\"['if-link', 'link-color-' + (i+1)]\" :style=\"{\n                                left: ((jumpInfo.jump.end.row + 2)* 7) + 'px', \n                                top: (jumpInfo.jump.end.line * 38 + 14) + 'px',\n                                width: ((Math.abs(jumpInfo.jump.end.row - mapLineLength) + 4 * (i + 1) - 2) * 7) + 'px'\n                            }\"></div>\n                        <div :class=\"['if-link', 'link-color-' + (i+1)]\" :style=\"{\n                                left: ((jumpInfo.label.end.row + 2)* 7) + 'px', \n                                top: (jumpInfo.label.end.line * 38 + 14) + 'px',\n                                width: ((Math.abs(jumpInfo.label.end.row - mapLineLength) + 4 * (i + 1) - 2) * 7) + 'px'\n                            }\"></div>\n                    </div>\n\n                </div>\n\n                <div class=\"lines\">\n                    <div v-for=\"(line, idx) in lines\" class=\"line\">\n                        <div class=\"line-indicator\" :class='[idx == interpreterContext.line && \"active\"]'>&nbsp;</div>\n                        <div class=\"line-number\">{{ idx }}</div>\n                        <div class=\"line-content\">\n                            &nbsp;\n                            <div v-for=\"token in line\" :class='[\"token\", token.error && \"error\"]' :style=\"{left: (token.pos.row * 7) + 'px'}\"\n                                @click=\"showNodeInfo(token)\">\n                            </div>\n                            <div v-if=\"originLines[idx].highlightRange !== undefined\" :class='[\"token\", \"ast-range\"]'\n                                :style=\"{left: (originLines[idx].highlightRange[0] * 7) + 'px', \n                        width: (originLines[idx].highlightRange[1] * 7) + 'px'}\">&nbsp;</div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div> "
  })));
  exports.default = default_1;
  

});