define('output/highlights/index', ['require', 'exports', 'module', "vue", "output/highlights/level_selector", "output/highlights/editor", "output/highlights/player"], function(require, exports, module) {

  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var Vue = require("vue");
  var level_selector_1 = require("output/highlights/level_selector");
  var editor_1 = require("output/highlights/editor");
  var player_1 = require("output/highlights/player");
  Vue.use({
      install: function (vue) {
          vue.mixin(vue.extend({
              beforeCreate: function () {
                  var originalCreateElement = this.$createElement;
                  this.$createElement = function (tag, data) {
                      var children = [];
                      for (var _i = 2; _i < arguments.length; _i++) {
                          children[_i - 2] = arguments[_i];
                      }
                      return originalCreateElement(tag, data, children);
                  };
              },
          }));
      },
  });
  var mainVmModes;
  (function (mainVmModes) {
      mainVmModes[mainVmModes["level_selector"] = 0] = "level_selector";
      mainVmModes[mainVmModes["player"] = 1] = "player";
      mainVmModes[mainVmModes["editor"] = 2] = "editor";
  })(mainVmModes || (mainVmModes = {}));
  var config = {
      el: '#main',
      template: /* template */ "\n    <div>\n        <level_selector @change=\"changeHandler\"></level_selector>\n        <player v-if=\"currentMode == mainVmModes.player\" ref=\"player\" />\n        <editor v-else-if=\"currentMode == mainVmModes.editor\" />\n    </div>\n    ",
      components: {
          level_selector: level_selector_1.default,
          player: player_1.default,
          editor: editor_1.default
      },
      data: function () {
          return {
              mainVmModes: mainVmModes,
              currentMode: mainVmModes.level_selector
          };
      },
      methods: {
          changeHandler: function (index) {
              console.log('changed', index);
              this.currentMode = mainVmModes.player;
              this.$nextTick(function () {
                  this.$refs.player.loadLevel(index);
              });
          }
      }
  };
  new Vue(config);
  

});