define('output/highlights/context_mgr_mixin', ['require', 'exports', 'module', "output/interpreter/interpreter_with_jump", "output/parser/parser_with_jump"], function(require, exports, module) {

  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var interpreter_with_jump_1 = require("output/interpreter/interpreter_with_jump");
  var parser_with_jump_1 = require("output/parser/parser_with_jump");
  var interpreter_with_jump_2 = require("output/interpreter/interpreter_with_jump");
  exports.context_mgr_mixin = {
      data: function () {
          return {
              infos: {
                  ast: [],
                  jumpTable: {},
              },
              sevenBHContext: interpreter_with_jump_1.makeSevenBHContext(1, 1),
              interpreterContext: null,
          };
      },
      methods: {
          makeContextInfo: function (ctx, tokens) {
              var infos = {
                  ast: [],
                  jumpTable: {},
              };
              try {
                  var parserContext = parser_with_jump_1.makeParserContext(ctx, tokens);
                  var ast = parser_with_jump_1.makeAst(parserContext);
                  infos.ast = ast;
                  infos.jumpTable = parser_with_jump_1.makeJumpTable(ast);
              }
              catch (error) {
                  console.log(error);
                  error.token.error = 1;
              }
              this.infos = infos;
          },
          isFinish: function () {
              console.log('is finish ', this.interpreterContext.tokenIndex >= this.infos.ast.length);
              return this.interpreterContext.tokenIndex >= this.infos.ast.length;
          },
          reload: function () {
              this.sevenBHContext = interpreter_with_jump_1.loadSevenBHContext(this.currentLevel);
              this.interpreterContext = interpreter_with_jump_1.makeInterpreterContext();
          },
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
          tick: function () {
              interpreter_with_jump_2.interpreter(this.infos.ast, this.interpreterContext, this.sevenBHContext, this.infos.jumpTable);
          },
      }
  };
  

});