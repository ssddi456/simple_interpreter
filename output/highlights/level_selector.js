define('output/highlights/level_selector', ['require', 'exports', 'module', "output/data/levels"], function(require, exports, module) {

  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var levels_1 = require("output/data/levels");
  exports.default = {
      data: function () {
          return {
              levels: levels_1.default,
          };
      },
      methods: {
          selectLevel: function (n) {
              console.log(arguments);
              this.emit('change', n);
          }
      },
      render: function (h) {
          var _this = this;
          return (h("div", { if: this.levels.length }, this.levels.map(function (element, idx) {
              return h("span", { onClick: _this.selectLevel }, (idx + 1) + '.level name');
          })));
      },
  };
  

});