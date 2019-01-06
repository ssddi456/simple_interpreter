define('output/highlights/type_mixins', ['require', 'exports', 'module', "output/interpreter/interpreter_with_jump"], function(require, exports, module) {

  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var interpreter_with_jump_1 = require("output/interpreter/interpreter_with_jump");
  exports.default = {
      data: function () {
          return {
              SevenBHMapMaker: interpreter_with_jump_1.SevenBHMapMaker
          };
      },
      methods: {
          getCellClass: function (cell) {
              if (cell.type == interpreter_with_jump_1.SevenBHMapMaker.datacube) {
                  return interpreter_with_jump_1.SevenBHMapMaker[interpreter_with_jump_1.SevenBHMapMaker.datacube];
              }
              else if (cell.type == interpreter_with_jump_1.SevenBHMapMaker.worker) {
                  if (!cell.holds) {
                      return interpreter_with_jump_1.SevenBHMapMaker[interpreter_with_jump_1.SevenBHMapMaker.worker];
                  }
                  else {
                      return 'worker-with-datacube';
                  }
              }
              return interpreter_with_jump_1.SevenBHMapMaker[cell.type];
          },
          getCellContent: function (cell) {
              if (cell.type == interpreter_with_jump_1.SevenBHMapMaker.datacube) {
                  return cell.value;
              }
              else if (cell.type == interpreter_with_jump_1.SevenBHMapMaker.worker) {
                  if (cell.holds) {
                      return cell.holds.value;
                  }
              }
          },
      }
  };
  

});