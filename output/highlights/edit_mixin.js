define('output/highlights/edit_mixin', ['require', 'exports', 'module', "output/interpreter/interpreter_with_jump"], function(require, exports, module) {

  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var interpreter_with_jump_1 = require("output/interpreter/interpreter_with_jump");
  var PointerMode;
  (function (PointerMode) {
      PointerMode[PointerMode["pointer"] = 0] = "pointer";
      PointerMode[PointerMode["brush"] = 1] = "brush";
  })(PointerMode || (PointerMode = {}));
  var DisplayMode;
  (function (DisplayMode) {
      DisplayMode["edit"] = "edit";
      DisplayMode["playing"] = "playing";
  })(DisplayMode || (DisplayMode = {}));
  var edit_mixin_methods = {
      init: function () {
          var newContext = interpreter_with_jump_1.makeSevenBHContext(Number(this.width), Number(this.height));
          if (this.editSevenBHContext) {
              for (var i = 0; i < newContext.map.length; i++) {
                  var element = newContext.map[i];
                  var oldElement = this.editSevenBHContext.map[i];
                  if (element && oldElement) {
                      for (var j = 0; j < element.length; j++) {
                          var cell = element[j];
                          var oldCell = oldElement[j];
                          if (cell && oldCell) {
                              cell.type = oldCell.type;
                              if (oldCell.type == interpreter_with_jump_1.SevenBHMapMaker.datacube) {
                                  cell.value = oldCell.value;
                              }
                          }
                      }
                  }
              }
          }
          this.editSevenBHContext = newContext;
      },
      mapInfo: function () {
          return JSON.stringify(this.editSevenBHContext, null, 2);
      },
      toggleMode: function () {
          var idx = this.modes.indexOf(this.mode);
          if (idx >= this.modes.length - 1) {
              this.mode = this.modes[0];
          }
          else {
              this.mode = this.modes[idx + 1];
          }
      },
      setPointer: function () {
          this.pointerMode = PointerMode.pointer;
      },
      setBrush: function (type) {
          this.pointerMode = PointerMode.brush;
          this.brush = type;
      },
      doClick: function (item) {
          if (this.pointerMode == PointerMode.pointer) {
              this.showItem(item);
          }
          else {
              this.doBrush(item);
          }
      },
      showItem: function (item) {
      },
      startBrush: function () {
          if (this.pointerMode == PointerMode.brush) {
              this.brushing = true;
          }
      },
      endBrush: function () {
          this.brushing = false;
      },
      doBrush: function (item, isMove) {
          if (isMove === void 0) { isMove = false; }
          if (isMove) {
              if (this.brushing) {
                  item.type = this.brush;
              }
          }
          else if (this.pointerMode == PointerMode.brush) {
              item.type = this.brush;
          }
      }
  };
  exports.edit_mixin = {
      data: function () {
          return {
              pointerMode: PointerMode.pointer,
              PointerMode: PointerMode,
              brush: interpreter_with_jump_1.SevenBHMapMaker.floor,
              brushTypes: interpreter_with_jump_1.SevenBHMapMaker,
              width: 10,
              height: 10,
              editSevenBHContext: undefined,
              brushing: false,
          };
      },
      created: function () {
          this.init();
      },
      methods: edit_mixin_methods,
      watch: {
          width: function () {
              this.init();
          },
          height: function () {
              this.init();
          }
      }
  };
  

});