define('output/highlights/code_view_mixin', ['require', 'exports', 'module', "output/parser/tokenizer", "output/printer/printer", "output/walker/walker_with_jump"], function(require, exports, module) {

  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var tokenizer_1 = require("output/parser/tokenizer");
  var printer_1 = require("output/printer/printer");
  var walker_with_jump_1 = require("output/walker/walker_with_jump");
  exports.code_view_mixin = {
      data: function () {
          return {
              lines: [],
              astInfo: [],
              originLines: [],
              mapLineLength: 0,
          };
      },
      methods: {
          loadCode: function (code) {
              var ctx = tokenizer_1.makeTokenizerContext(code);
              var tokens = tokenizer_1.tokenize(ctx);
              this.lines = printer_1.tokensToLines(tokens);
              this.originLines = printer_1.makeLineInfo(code);
              return {
                  ctx: ctx,
                  tokens: tokens,
              };
          },
          showNodeInfo: function (node) {
              var ast = findNodeByOffset(this.infos.ast, node.pos.offset);
              this.astInfo = ast;
          },
          removeAllHighlightLine: function () {
              var originLines = this.originLines;
              for (var i = 0; i < originLines.length; i++) {
                  var element = originLines[i];
                  removeHighlightLine(element);
              }
          },
          showAstRange: function (ast, dontRemove) {
              if (dontRemove === void 0) { dontRemove = false; }
              var originLines = this.originLines;
              for (var i = 0; i < originLines.length; i++) {
                  var element = originLines[i];
                  if (i > ast.start.line && i < ast.end.line) {
                      addHighlightLine(element, 0);
                  }
                  else if (i < ast.start.line || i > ast.end.line) {
                      dontRemove || removeHighlightLine(element);
                  }
                  else {
                      if (ast.start.line == ast.end.line) {
                          if (i == ast.start.line) {
                              addHighlightLine(element, ast.start.row, ast.end.row);
                          }
                      }
                      else {
                          if (i == ast.start.line) {
                              addHighlightLine(element, ast.start.row);
                          }
                          else if (i == ast.end.line) {
                              addHighlightLine(element, 0, ast.end.row);
                          }
                      }
                  }
              }
          },
          astToString: function (ast) {
              var ret = ast.type;
              switch (ast.type) {
                  case 'value':
                      ret += '(' + ast.value + ')';
                      break;
                  case 'identifier':
                      ret += '<' + ast.name + '>';
                      break;
                  case 'call':
                      ret += '<' + ast.name + '>';
                      break;
                  case 'binary':
                      ret += ': ' + ast.operator;
                      break;
                  default:
                      break;
              }
              return ret;
          },
          highlights: function (linkInfo) {
              this.removeAllHighlightLine();
              'if' in linkInfo && this.showAstRange(linkInfo.if, true);
              'else' in linkInfo && this.showAstRange(linkInfo.else, true);
              'endif' in linkInfo && this.showAstRange(linkInfo.endif, true);
              'jump' in linkInfo && this.showAstRange(linkInfo.jump, true);
              'label' in linkInfo && this.showAstRange(linkInfo.label, true);
          },
      }
  };
  function findNodeByOffset(ast, offset) {
      var target = [];
      walker_with_jump_1.walk(ast, function (element) {
          var start = element.start.offset;
          var end = element.end.offset;
          if (start > offset || end < offset) {
              return false;
          }
          target.push(element);
      });
      return target;
  }
  function addHighlightLine(line, start, end) {
      line.highlightRange = [start, (end || line.length) - start];
  }
  function removeHighlightLine(line) {
      line.highlightRange = undefined;
  }
  

});