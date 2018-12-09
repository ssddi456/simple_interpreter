var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "../parser/parser_with_jump", "../parser/tokenizer"], function (require, exports, parser_with_jump_1, tokenizer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function makeSevenBHFloor(row, line) {
        return {
            pos: {
                row: row,
                line: line,
            },
            type: SevenBHMapMaker.floor,
            has: []
        };
    }
    function makeSevenBHDataCube() {
        return {
            value: 0,
            pos: {
                line: 0,
                row: 0,
            },
            type: SevenBHMapMaker.datacube,
        };
    }
    exports.makeSevenBHDataCube = makeSevenBHDataCube;
    function makeSevenBHWorker() {
        return {
            pos: {
                line: 0,
                row: 0,
            },
            holds: undefined,
            type: SevenBHMapMaker.worker,
        };
    }
    exports.makeSevenBHWorker = makeSevenBHWorker;
    var SevenBHMapMaker;
    (function (SevenBHMapMaker) {
        SevenBHMapMaker[SevenBHMapMaker["worker"] = 0] = "worker";
        SevenBHMapMaker[SevenBHMapMaker["floor"] = 1] = "floor";
        SevenBHMapMaker[SevenBHMapMaker["datacube"] = 2] = "datacube";
        SevenBHMapMaker[SevenBHMapMaker["hole"] = 3] = "hole";
        SevenBHMapMaker[SevenBHMapMaker["grinder"] = 4] = "grinder";
        SevenBHMapMaker[SevenBHMapMaker["generator"] = 5] = "generator";
        SevenBHMapMaker[SevenBHMapMaker["wall"] = 6] = "wall";
    })(SevenBHMapMaker = exports.SevenBHMapMaker || (exports.SevenBHMapMaker = {}));
    function makeSevenBHContext(width, height) {
        var map = [];
        for (var i = 0; i < height; i++) {
            var element = [];
            map.push(element);
            for (var j = 0; j < width; j++) {
                element.push(makeSevenBHFloor(j, i));
            }
        }
        return {
            workers: [],
            datacubes: [],
            map: map,
            width: width,
            height: height,
        };
    }
    exports.makeSevenBHContext = makeSevenBHContext;
    function loadSevenBHContext(context) {
        var new_context = makeSevenBHContext(context.width, context.height);
        new_context.map = [];
        context.map.forEach(function (x) {
            var new_row = [];
            new_context.map.push(new_row);
            x.forEach(function (y) {
                var z = __assign({}, y);
                new_row.push(z);
                switch (z.type) {
                    case SevenBHMapMaker.worker:
                        var worker = makeSevenBHWorker();
                        worker.pos = __assign({}, z.pos);
                        new_context.workers.push(worker);
                        var floor = z;
                        floor.type = SevenBHMapMaker.floor;
                        (floor.has = []).push(worker);
                        break;
                    case SevenBHMapMaker.datacube:
                        var datacube = makeSevenBHDataCube();
                        datacube.pos = __assign({}, z.pos);
                        datacube.value = z.value;
                        new_context.datacubes.push(datacube);
                        floor = z;
                        floor.type = SevenBHMapMaker.floor;
                        (floor.has = []).push(datacube);
                        break;
                    case SevenBHMapMaker.floor:
                        z.has = [];
                        z.pos = __assign({}, y.pos);
                        break;
                    default:
                        break;
                }
            });
        });
        return new_context;
    }
    exports.loadSevenBHContext = loadSevenBHContext;
    function makeInterpreterContext() {
        return {
            line: 0,
            tokenIndex: 0,
            currentToken: undefined,
            memories: [],
            movedInStep: false,
            beforeStep: function () {
                this.movedInStep = false;
            },
            afterStep: function () {
                if (!this.movedInStep) {
                    this.nextLine();
                }
            },
            nextLine: function () {
                this.movedInStep = true;
                this.currentToken = undefined;
                this.tokenIndex += 1;
            },
            goToLine: function (line) {
                this.movedInStep = true;
                this.currentToken = undefined;
                this.tokenIndex = line;
            }
        };
    }
    exports.makeInterpreterContext = makeInterpreterContext;
    function isMyitem(ast) {
        return ast.type === 'identifier' && ast.name === 'myitem';
    }
    function isObjectType(ast) {
        return ast.type === 'identifier' && parser_with_jump_1.objectTypes.indexOf(ast.name) !== -1;
    }
    function isTypeCheck(ast) {
        var ops = ast.operator;
        if ((ops === '==' || ops === '!=')
            && (isObjectType(ast.left) || isObjectType(ast.right))) {
            return true;
        }
        return false;
    }
    function isValueCompare(ast) {
        var ops = ast.operator;
        if (tokenizer_1.compareOperators.indexOf(ops) !== -1) {
            return true;
        }
        else {
            return false;
        }
    }
    function getSevenBHObjectValue(obj) {
        if (obj) {
            if (obj.type == SevenBHMapMaker.datacube) {
                return obj.value;
            }
        }
    }
    function compareWithValue(value1, ops, value) {
        switch (ops) {
            case '!=':
                return value1 != value;
            case '!==':
                return value1 !== value;
            case '==':
                return value1 == value;
            case '<=':
                return value1 <= value;
            case '<':
                return value1 < value;
            case '>':
                return value1 > value;
            case '>=':
                return value1 >= value;
        }
    }
    function LogicOperator(value1, ops, value) {
        switch (ops) {
            case 'and':
            case '&&':
                return value1 && value;
            case 'or':
            case '||':
                return value1 || value;
        }
    }
    function getBinaneryValue(ast, context, mapContext, jumpTable) {
        var ops = ast.operator;
        if (isTypeCheck(ast)) {
            var obj = void 0;
            var type_1;
            if (isObjectType(ast.left)) {
                type_1 = ast.left.name;
                obj = getIdentifierValue(ast.right, context, mapContext);
            }
            else {
                type_1 = ast.right.name;
                obj = getIdentifierValue(ast.left, context, mapContext);
            }
            if (type_1 === 'nothing') {
                return !obj || obj.type == SevenBHMapMaker.floor;
            }
            switch (ops) {
                case '==':
                    if (obj.type === SevenBHMapMaker[type_1]) {
                        return true;
                    }
                    else {
                        if (obj.type === SevenBHMapMaker.floor) {
                            return obj.has.some(function (x) { return x.type === SevenBHMapMaker[type_1]; });
                        }
                        else {
                            return false;
                        }
                    }
                case '!=':
                    if (obj.type !== SevenBHMapMaker[type_1]) {
                        if (obj.type === SevenBHMapMaker.floor) {
                            return obj.has.every(function (x) { return x.type !== SevenBHMapMaker[type_1]; });
                        }
                        else {
                            return true;
                        }
                    }
                    else {
                        return false;
                    }
                    return;
            }
        }
        else if (isValueCompare(ast)) {
            var obj = void 0;
            if (ast.left.type == 'value') {
                compareWithValue(getSevenBHObjectValue(getValue(ast.right, context, mapContext, jumpTable)), ops, ast.left.value);
            }
            else if (ast.right.type == 'value') {
                compareWithValue(getSevenBHObjectValue(getValue(ast.left, context, mapContext, jumpTable)), ops, ast.right.value);
            }
            else {
                compareWithValue(getSevenBHObjectValue(getValue(ast.left, context, mapContext, jumpTable)), ops, getSevenBHObjectValue(getValue(ast.right, context, mapContext, jumpTable)));
            }
        }
        else if (tokenizer_1.logicOperators.indexOf(ops)) {
            // 这里有点问题
            return LogicOperator(getValue(ast.left, context, mapContext, jumpTable), ops, getValue(ast.right, context, mapContext, jumpTable));
        }
    }
    exports.getBinaneryValue = getBinaneryValue;
    function getIdentifierValue(ast, context, mapContext) {
        var name = ast.name;
        if (isMyitem(ast)) {
            return mapContext.workers[0].holds;
        }
        else if (parser_with_jump_1.memories.indexOf(name) !== -1) {
            return context.memories[name];
        }
        else if (posKeywords.indexOf(name) !== -1) {
            return getDirectionValue(name, mapContext);
        }
    }
    exports.getIdentifierValue = getIdentifierValue;
    var posKeywords = ['c', 'nw', 'w', 'sw', 'n', 'ne', 'e', 'se', 's',];
    function getDirectionPos(name, mapContext) {
        var worker = mapContext.workers[0];
        var pos = worker.pos;
        switch (name) {
            case 'c':
                return pos;
            case 'nw':
                return {
                    row: pos.row - 1,
                    line: pos.line - 1,
                };
            case 'w':
                return {
                    row: pos.row - 1,
                    line: pos.line,
                };
            case 'sw':
                return {
                    row: pos.row - 1,
                    line: pos.line + 1,
                };
            case 'n':
                return {
                    row: pos.row,
                    line: pos.line - 1,
                };
            case 'ne':
                return {
                    row: pos.row + 1,
                    line: pos.line - 1,
                };
            case 'e':
                return {
                    row: pos.row + 1,
                    line: pos.line,
                };
            case 'se':
                return {
                    row: pos.row + 1,
                    line: pos.line + 1,
                };
            case 's':
                return {
                    row: pos.row,
                    line: pos.line + 1,
                };
        }
    }
    exports.getDirectionPos = getDirectionPos;
    function getDirectionValue(name, mapContext) {
        var pos = getDirectionPos(name, mapContext);
        if (pos) {
            return (mapContext.map[pos.line] || [])[pos.row];
        }
    }
    exports.getDirectionValue = getDirectionValue;
    function doIf(ast, context, mapContext, jumpTable) {
        if (getValue(ast.expression, context, mapContext, jumpTable)) {
            context.nextLine();
        }
        else {
            // 这里应该 goto else or endif
            var ifInfo = jumpTable.ifPosMap.filter(function (x) { return x.if == ast; })[0];
            if (ifInfo.else) {
                context.goToLine(ifInfo.else);
            }
            else {
                context.goToLine(ifInfo.endif);
            }
        }
    }
    exports.doIf = doIf;
    function doJump(ast, context, jumpTable) {
        var label = jumpTable.labelPosMap[ast.labelName];
        context.goToLine(label);
    }
    exports.doJump = doJump;
    function doCall(ast, context, mapContext) {
        console.log('do call', ast.name);
        var func = ast.name.name;
        var params = ast.params;
        switch (func) {
            case 'step':
                doStepCall(params, context, mapContext);
                break;
            case 'pickup':
                doPickupCall(params, context, mapContext);
                break;
            case 'drop':
                doDropCall(params, context, mapContext);
                break;
            case 'write':
                doWriteCall(params, context, mapContext);
            default:
                break;
        }
    }
    exports.doCall = doCall;
    function doStepCall(params, context, mapContext) {
        var actualDirection = params[Math.floor(Math.random() * params.length)];
        var worker = mapContext.workers[0];
        var cell = getValue(actualDirection, context, mapContext, null);
        var currentCell = getDirectionValue('c', mapContext);
        if (cell && cell.type == SevenBHMapMaker.floor) {
            cell.has.push(worker);
            currentCell.has.splice(currentCell.has.indexOf(worker), 1);
            worker.pos = __assign({}, cell.pos);
        }
    }
    exports.doStepCall = doStepCall;
    function doPickupCall(params, context, mapContext) {
        var actualDirection = params[Math.floor(Math.random() * params.length)];
        var worker = mapContext.workers[0];
        var cell = getValue(actualDirection, context, mapContext, null);
        if (cell && cell.type == SevenBHMapMaker.floor) {
            if (worker.holds) {
                throw new Error('i hold some things');
            }
            if (!cell.has.some(function (x) { return x.type == SevenBHMapMaker.datacube; })) {
                throw new Error('nothing to pickup');
            }
            var datacube = cell.has.filter(function (x) { return x.type == SevenBHMapMaker.datacube; })[0];
            cell.has.splice(cell.has.indexOf(datacube), 1);
            worker.holds = datacube;
        }
    }
    exports.doPickupCall = doPickupCall;
    function doDropCall(params, context, mapContext) {
        var worker = mapContext.workers[0];
        var currentCell = getDirectionValue('c', mapContext);
        if (currentCell && currentCell.type == SevenBHMapMaker.floor) {
            if (!worker.holds) {
                throw new Error('nothing to drop');
            }
            if (currentCell.has.some(function (x) { return x.type == SevenBHMapMaker.datacube; })) {
                throw new Error('i cannot drop here');
            }
            var datacube = worker.holds;
            worker.holds = undefined;
            currentCell.has.push(datacube);
        }
    }
    exports.doDropCall = doDropCall;
    function doWriteCall(params, context, mapContext) {
    }
    exports.doWriteCall = doWriteCall;
    function getValue(ast, context, mapContext, jumpTable) {
        switch (ast.type) {
            case 'value':
                return ast.value;
            case 'identifier':
                return getIdentifierValue(ast, context, mapContext);
            case 'binary':
                return getBinaneryValue(ast, context, mapContext, jumpTable);
            case 'if':
                return doIf(ast, context, mapContext, jumpTable);
            case 'jump':
                return doJump(ast, context, jumpTable);
            case 'call':
                return doCall(ast, context, mapContext);
            default:
                break;
        }
    }
    exports.getValue = getValue;
    function getCurrentToken(ast, context) {
        if (!context.currentToken && context.tokenIndex < ast.length) {
            context.currentToken = ast[context.tokenIndex];
            context.line = context.currentToken.start.line;
        }
    }
    function interpreter(asts, context, mapContext, jumpTable) {
        getCurrentToken(asts, context);
        if (context.currentToken) {
            context.beforeStep();
            getValue(context.currentToken, context, mapContext, jumpTable);
            context.afterStep();
            getCurrentToken(asts, context);
        }
    }
    exports.interpreter = interpreter;
});
