define('output/highlights/editor', ['require', 'exports', 'module', "output/highlights/edit_mixin", "output/node_modules/vue-property-decorator/lib/vue-property-decorator.umd", "output/highlights/util_mixins"], function(require, exports, module) {

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
  var edit_mixin_1 = require("output/highlights/edit_mixin");
  var vue_property_decorator_1 = require("output/node_modules/vue-property-decorator/lib/vue-property-decorator.umd");
  var util_mixins_1 = require("output/highlights/util_mixins");
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
      mixins: [edit_mixin_1.edit_mixin, util_mixins_1.default],
      template: /* template */ "\n    <div>\n        <div class=\"container-fluid\">\n            <div class=\"col-sm-12\">\n                <div class=\"form\">\n                    <div class=\"form-group\">\n                        <div class=\"form-inline\">\n                            <div class=\"input-group\">\n                                <label>width</label>\n                                <input type=\"text\" class=\"form-control\" v-model=\"width\">\n                            </div>\n                            <div class=\"input-group\">\n                                <label>height</label>\n                                <input type=\"text\" class=\"form-control\" v-model=\"height\">\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"form-group\">\n                        <div class=\"btn-group\">\n                            <div class=\"btn btn-default\" :class=\"{'active': pointerMode == PointerMode.pointer}\" @click=\"setPointer\">pointer</div>\n                        </div>\n                        <div class=\"btn-group\">\n                            <div :class='[\"btn btn-default\", (brush == type && pointerMode == PointerMode.brush) && \"active\"]'\n                                v-for=\"(type, key) in brushTypes\" @click=\"setBrush(type)\" v-if=\"typeof type== 'number'\">{{key}}</div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"col-sm-6\">\n                <div class=\"row\">\n                    <div class=\"cell-map col-sm-12\" @mousedown=\"startBrush\" @mouseup=\"endBrush\">\n                        <div class=\"cell-line\" v-for=\"row in editSevenBHContext.map\">\n                            <div :class=\"['cell', getCellClass(cell)]\" v-for=\"cell in row\" @click=\"doClick(cell)\"\n                                @mousemove=\"doBrush(cell, true)\"></div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"col-sm-6\">\n                <pre v-html=\"mapInfo()\"></pre>\n            </div>\n        </div>\n    </div>\n        "
  })));
  exports.default = default_1;
  

});