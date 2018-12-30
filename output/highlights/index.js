define('output/highlights/index', ['require', 'exports', 'module', "vue", "output/highlights/player_mixin", "output/highlights/context_mgr_mixin", "output/highlights/edit_mixin", "output/highlights/code_view_mixin", "output/highlights/level_selector", "output/highlights/test_components"], function(require, exports, module) {

  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var Vue = require("vue");
  var player_mixin_1 = require("output/highlights/player_mixin");
  var context_mgr_mixin_1 = require("output/highlights/context_mgr_mixin");
  var edit_mixin_1 = require("output/highlights/edit_mixin");
  var code_view_mixin_1 = require("output/highlights/code_view_mixin");
  var level_selector_1 = require("output/highlights/level_selector");
  var test_components_1 = require("output/highlights/test_components");
  ;
  var config = {
      el: '#main',
      mixins: [context_mgr_mixin_1.context_mgr_mixin, player_mixin_1.player_mixin, edit_mixin_1.edit_mixin, code_view_mixin_1.code_view_mixin],
      components: {
          level_selector: level_selector_1.default,
          test_components: test_components_1.default
      },
      data: {},
      created: function () {
      },
      methods: {}
  };
  new Vue(config);
  

});