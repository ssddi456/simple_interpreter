define('output/highlights/level_selector', ['require', 'exports', 'module', "output/node_modules/vue-property-decorator/lib/vue-property-decorator.umd", "output/data/levels"], function(require, exports, module) {

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
  var levels_1 = require("output/data/levels");
  var default_1 = /** @class */ (function (_super) {
      __extends(default_1, _super);
      function default_1() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.levels = levels_1.default;
          return _this;
      }
      default_1.prototype.selectLevel = function (n) {
          console.log(arguments);
          this.$emit('change', n);
      };
      default_1.prototype.render = function (h) {
          var _this = this;
          return (h("div", { if: this.levels.length }, this.levels.map(function (element, idx) {
              return h('span', {
                  on: {
                      click: function (e) {
                          _this.selectLevel(idx);
                      }
                  }
              }, ["Day " + (idx + 1) + " " + element.name]);
          })));
      };
      default_1 = __decorate([
          vue_property_decorator_1.Component
      ], default_1);
      return default_1;
  }(vue_property_decorator_1.Vue));
  exports.default = default_1;
  

});