define('output/highlights/level_mgr_mixin', ['require', 'exports', 'module', "output/data/levels"], function(require, exports, module) {

  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var levels_1 = require("output/data/levels");
  var contents = ["a:\nb:\nmem1 = nearest datacube\nstep mem1\nif c == datacube and\n  nw != datacube and\n  w != datacube:\n    step nw,w,sw,n,s,ne,e,se\n    jump b\nendif\npickup mem1\nc:\nif w != datacube and\n  e != datacube and\n  c != datacube and\n  nw != datacube and\n  myitem == datacube:\n    drop\n    jump a\nendif\nstep nw,w,sw,n,s,ne,e,se\njump c\n",
      "if c == datacube and\n  nw != datacube:\n    step nw,w,sw,n,s,ne,e,se\n    jump b\nendif\n", "step s\nstep s\nstep s\nstep s\npickup c\nstep s\ndrop\n",
      "a:\nif c != datacube:\n    step s\n    jump a\nendif\npickup c\nstep s\ndrop\n"];
  function makePlayStatus() {
      return {
          code: ''
      };
  }
  exports.level_mgr_mixin = {
      data: function () {
          return {
              levels: levels_1.default,
              playStatuses: [],
              currentLevelIndex: -1,
              currentLevel: undefined,
          };
      },
      methods: {
          loadLevel: function (n) {
              this.currentLevelIndex = n;
              this.currentLevel = this.levels[this.currentLevelIndex];
              this.playStatuses[this.currentLevelIndex] = this.playStatuses[this.currentLevelIndex] || makePlayStatus();
              var playStatus = this.playStatuses[this.currentLevelIndex];
              var _a = this.loadCode(playStatus.code), ctx = _a.ctx, tokens = _a.tokens;
              this.makeContextInfo(ctx, tokens);
              this.reload();
          }
      }
  };
  

});