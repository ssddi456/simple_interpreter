import { Ast, JumpTable, AstIdentifier, AstBinary, AstJump, AstIf, AstCall, objectTypes, memories } from "../parser/parser_with_jump";
import { AstExpression } from "../parser/parser";
import { compareOperators, BinaryOperator, CompareOperator, logicOperators, LogicOperator } from "../parser/tokenizer";

export interface Pos {
    line: number;
    row: number;
}

export interface SevenBHBaseObject {
    pos: Pos | undefined,
    type: SevenBHMapMaker

}

export interface SevenBHDataCube extends SevenBHBaseObject {
    value: number;
    type: SevenBHMapMaker.datacube;
}

export interface SevenBHFloor extends SevenBHBaseObject {
    type: SevenBHMapMaker.floor;
    has: SevenBHInteractivableObject[];
}

function makeSevenBHFloor(row: number, line: number): SevenBHFloor {
    return {
        pos: {
            row,
            line,
        },
        type: SevenBHMapMaker.floor,
        has: []
    };
}

export interface SevenBHHole extends SevenBHBaseObject {
    type: SevenBHMapMaker.hole;
}

export interface SevenBHWall extends SevenBHBaseObject {
    type: SevenBHMapMaker.wall;
}

export interface SevenBHGenerator extends SevenBHBaseObject {
    type: SevenBHMapMaker.generator;
}

export interface SevenBHGrinder extends SevenBHBaseObject {
    type: SevenBHMapMaker.grinder;
}


export function makeSevenBHDataCube(): SevenBHDataCube {
    return {
        value: 0,
        pos: {
            line: 0,
            row: 0,
        },
        type: SevenBHMapMaker.datacube,
    };
}

export interface SevenBHWorker extends SevenBHBaseObject {
    pos: Pos;
    holds: SevenBHDataCube | undefined;
    type: SevenBHMapMaker.worker;

}
export function makeSevenBHWorker(): SevenBHWorker {
    return {
        pos: {
            line: 0,
            row: 0,
        },
        holds: undefined,
        type: SevenBHMapMaker.worker,
    };
}

export type SevenBHObject = SevenBHDataCube |
    SevenBHWorker |
    SevenBHFloor |
    SevenBHHole |
    SevenBHWall |
    SevenBHGenerator |
    SevenBHGrinder;

export type SevenBHInteractivableObject = SevenBHDataCube | SevenBHWorker;

export enum SevenBHMapMaker {
    worker,
    floor,
    datacube,
    hole,
    grinder,
    generator,
    wall,
}

export interface SevenBHContext {
    workers: SevenBHWorker[];
    datacubes: SevenBHDataCube[];
    map: SevenBHObject[][];
    width: number,
    height: number,
}
export interface SevenBHLevel {
    map: SevenBHObject[][];
    width: number,
    height: number,
}

export function makeSevenBHContext(width: number, height: number): SevenBHContext {
    const map: SevenBHObject[][] = [];

    for (let i = 0; i < height; i++) {
        const element: SevenBHObject[] = [];
        map.push(element);
        for (let j = 0; j < width; j++) {
            element.push(makeSevenBHFloor(j, i));
        }
    }

    return {
        workers: [],
        datacubes: [],
        map,
        width,
        height,
    };
}

export function loadSevenBHContext(context: SevenBHLevel): SevenBHContext {
    const new_context = makeSevenBHContext(context.width, context.height);
    new_context.map = [];

    context.map.forEach(x => {
        const new_row = [] as SevenBHObject[];
        new_context.map.push(new_row);
        x.forEach(y => {
            const z: SevenBHObject = {
                ...y,

            };
            new_row.push(z);
            switch (z.type) {
                case SevenBHMapMaker.worker:
                    const worker = makeSevenBHWorker();
                    worker.pos = {
                        ...z.pos!
                    };
                    new_context.workers.push(worker);
                    let floor = (z as any) as SevenBHFloor;
                    floor.type = SevenBHMapMaker.floor;
                    (floor.has = [] as SevenBHInteractivableObject[]).push(worker);
                    break;
                case SevenBHMapMaker.datacube:
                    const datacube = makeSevenBHDataCube();
                    datacube.pos = {
                        ...z.pos!,
                    };
                    datacube.value = z.value;
                    new_context.datacubes.push(datacube);
                    floor = (z as any) as SevenBHFloor;
                    floor.type = SevenBHMapMaker.floor;
                    (floor.has = [] as SevenBHInteractivableObject[]).push(datacube);
                    break;
                case SevenBHMapMaker.floor:
                    z.has = [] as SevenBHInteractivableObject[];
                    z.pos = {
                        ...y.pos!
                    };
                    break;

                default:
                    break;
            }
        })
    });
    return new_context;
}

export interface InterpreterContext {
    line: number;
    tokenIndex: number;
    currentToken: Ast | undefined;
    memories: Array<number | SevenBHBaseObject>;
    movedInStep: boolean;
    beforeStep(): void;
    afterStep(): void;
    nextLine(): void;
    goToLine(line: number): void;
}

export function makeInterpreterContext(): InterpreterContext {
    return {
        line: 0,
        tokenIndex: 0,
        currentToken: undefined,
        memories: [],
        movedInStep: false,
        beforeStep() {
            this.movedInStep = false;
        },
        afterStep() {
            if (!this.movedInStep) {
                this.nextLine();
            }
        },
        nextLine() {
            this.movedInStep = true;
            this.currentToken = undefined;
            this.tokenIndex += 1;
        },
        goToLine(line: number) {
            this.movedInStep = true;
            this.currentToken = undefined;
            this.tokenIndex = line;
        }
    };
}

function isMyitem(ast: Ast) {
    return ast.type === 'identifier' && ast.name === 'myitem';
}



function isObjectType(ast: Ast) {
    return ast.type === 'identifier' && objectTypes.indexOf(ast.name) !== -1;
}

function isTypeCheck(ast: AstBinary): boolean {
    const ops = ast.operator;
    if ((ops === '==' || ops === '!=')
        && (isObjectType(ast.left) || isObjectType(ast.right))
    ) {
        return true;
    }
    return false;
}
function isValueCompare(ast: AstBinary): boolean {
    const ops = ast.operator;
    if (compareOperators.indexOf(ops as CompareOperator) !== -1) {
        return true;
    } else {
        return false
    }
}

function getSevenBHObjectValue(obj: SevenBHObject): number | undefined {
    if (obj) {
        if (obj.type == SevenBHMapMaker.datacube) {
            return obj.value;
        }
    }
}

function compareWithValue(value1: number | undefined, ops: CompareOperator, value: number | undefined) {
    switch (ops) {
        case '!=':
            return value1 != value;
        case '!==':
            return value1 !== value;
        case '==':
            return value1 == value;
        case '<=':
            return value1! <= value!;
        case '<':
            return value1! < value!;
        case '>':
            return value1! > value!;
        case '>=':
            return value1! >= value!;
    }
}
function LogicOperator(value1: any, ops: LogicOperator, value: any): boolean {
    switch (ops) {
        case 'and':
        case '&&':
            return value1 && value;
        case 'or':
        case '||':
            return value1 || value;
    }
}

export function getBinaneryValue(ast: AstBinary, context: InterpreterContext, mapContext: SevenBHContext, jumpTable: JumpTable): any {
    const ops = ast.operator;

    if (isTypeCheck(ast)) {
        let obj: SevenBHObject;
        let type: string;
        if (isObjectType(ast.left)) {
            type = (ast.left as AstIdentifier).name;
            obj = getIdentifierValue(ast.right as AstIdentifier, context, mapContext) as SevenBHObject;
        } else {
            type = (ast.right as AstIdentifier).name;
            obj = getIdentifierValue(ast.left as AstIdentifier, context, mapContext) as SevenBHObject;
        }
        if (type === 'nothing') {
            return !obj || obj.type == SevenBHMapMaker.floor;
        }
        switch (ops) {
            case '==':
                if (obj.type === SevenBHMapMaker[type]) {
                    return true;
                } else {
                    if (obj.type === SevenBHMapMaker.floor) {
                        return obj.has.some((x) => x.type === SevenBHMapMaker[type]);
                    } else {
                        return false;
                    }
                }
            case '!=':
                if (obj.type !== SevenBHMapMaker[type]) {
                    if(obj.type === SevenBHMapMaker.floor) {
                        return obj.has.every((x) => x.type !== SevenBHMapMaker[type]);
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
                return ;
        }
    } else if (isValueCompare(ast)) {
        let obj: SevenBHBaseObject;
        if (ast.left.type == 'value') {
            compareWithValue(
                getSevenBHObjectValue(getValue(ast.right, context, mapContext, jumpTable)),
                ops as CompareOperator,
                ast.left.value as number);
        } else if (ast.right.type == 'value') {
            compareWithValue(
                getSevenBHObjectValue(getValue(ast.left, context, mapContext, jumpTable)),
                ops as CompareOperator,
                ast.right.value as number);
        } else {
            compareWithValue(
                getSevenBHObjectValue(getValue(ast.left, context, mapContext, jumpTable)),
                ops as CompareOperator,
                getSevenBHObjectValue(getValue(ast.right, context, mapContext, jumpTable))
            );
        }
    } else if (logicOperators.indexOf(ops as LogicOperator)) {
        // 这里有点问题
        return LogicOperator(
            getValue(ast.left, context, mapContext, jumpTable),
            ops as LogicOperator,
            getValue(ast.right, context, mapContext, jumpTable),
        );
    }
}

export function getIdentifierValue(ast: AstIdentifier, context: InterpreterContext, mapContext: SevenBHContext, ): any {
    const name = ast.name;
    if (isMyitem(ast)) {
        return mapContext.workers[0].holds;
    } else if (memories.indexOf(name) !== -1) {
        return context.memories[name];
    } else if (posKeywords.indexOf(name as PosKeyword) !== -1) {
        return getDirectionValue(name as PosKeyword, mapContext);
    }
}

type PosKeyword = 'c' | 'nw' | 'w' | 'sw' | 'n' | 'ne' | 'e' | 'se' | 's';
const posKeywords: PosKeyword[] = ['c', 'nw', 'w', 'sw', 'n', 'ne', 'e', 'se', 's',];

export function getDirectionPos(name: PosKeyword, mapContext: SevenBHContext): Pos | undefined {
    const worker = mapContext.workers[0];
    const pos = worker.pos;
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
export function getDirectionValue(name: PosKeyword, mapContext: SevenBHContext) {
    const pos = getDirectionPos(name, mapContext);
    if (pos) {
        return (mapContext.map[pos.line] || [])[pos.row]!;
    }
}

export function doIf(ast: AstIf, context: InterpreterContext, mapContext: SevenBHContext, jumpTable: JumpTable, ) {
    if (getValue(ast.expression, context, mapContext, jumpTable)) {
        context.nextLine();
    } else {
        // 这里应该 goto else or endif
        const ifInfo = jumpTable.ifPosMap.filter(x => x.if == ast)[0];
        if (ifInfo.else) {
            context.goToLine(ifInfo.else);
        } else {
            context.goToLine(ifInfo.endif);
        }
    }
}

export function doJump(ast: AstJump, context: InterpreterContext, jumpTable: JumpTable, ) {
    const label = jumpTable.labelPosMap[ast.labelName];
    context.goToLine(label);
}

export function doCall(ast: AstCall, context: InterpreterContext, mapContext: SevenBHContext) {
    console.log('do call', ast.name);
    const func = ast.name.name;
    const params = ast.params;
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

export function doStepCall(params: AstExpression[], context: InterpreterContext, mapContext: SevenBHContext) {
    const actualDirection = params[Math.floor(Math.random() * params.length)];
    const worker = mapContext.workers[0];
    const cell = getValue(actualDirection, context, mapContext, null as any) as SevenBHObject | undefined;
    const currentCell = getDirectionValue('c', mapContext)! as SevenBHFloor;

    if (cell && cell.type == SevenBHMapMaker.floor) {
        cell.has.push(worker);
        currentCell.has.splice(currentCell.has.indexOf(worker), 1);
        worker.pos = { ...cell.pos! };
    }
}

export function doPickupCall(params: AstExpression[], context: InterpreterContext, mapContext: SevenBHContext) {
    const actualDirection = params[Math.floor(Math.random() * params.length)];
    const worker = mapContext.workers[0];
    const cell = getValue(actualDirection, context, mapContext, null as any) as SevenBHObject | undefined;
    if (cell && cell.type == SevenBHMapMaker.floor) {
        if (worker.holds) {
            throw new Error('i hold some things');
        }
        if (!cell.has.some(x => x.type == SevenBHMapMaker.datacube)) {
            throw new Error('nothing to pickup');
        }
        var datacube = cell.has.filter(x => x.type == SevenBHMapMaker.datacube)[0];
        cell.has.splice(cell.has.indexOf(datacube), 1);
        worker.holds = datacube as SevenBHDataCube;
    }
}
export function doDropCall(params: AstExpression[], context: InterpreterContext, mapContext: SevenBHContext) {
    const worker = mapContext.workers[0];
    const currentCell = getDirectionValue('c', mapContext)! as SevenBHFloor;

    if (currentCell && currentCell.type == SevenBHMapMaker.floor) {
        if (!worker.holds) {
            throw new Error('nothing to drop');
        }
        if (currentCell.has.some(x => x.type == SevenBHMapMaker.datacube)) {
            throw new Error('i cannot drop here');
        }
        var datacube = worker.holds;
        worker.holds = undefined;
        currentCell.has.push(datacube);
    }
}
export function doWriteCall(params: AstExpression[], context: InterpreterContext, mapContext: SevenBHContext) {
}


export function getValue(ast: Ast, context: InterpreterContext, mapContext: SevenBHContext, jumpTable: JumpTable, ): any {
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

function getCurrentToken(ast: Ast[], context: InterpreterContext, ) {
    if (!context.currentToken && context.tokenIndex < ast.length) {
        context.currentToken = ast[context.tokenIndex];
        context.line = context.currentToken.start.line;
    }
}

export function interpreter(asts: Ast[], context: InterpreterContext, mapContext: SevenBHContext, jumpTable: JumpTable, ) {
    getCurrentToken(asts, context);

    if (context.currentToken) {
        context.beforeStep();
        getValue(context.currentToken, context, mapContext, jumpTable);
        context.afterStep();
        getCurrentToken(asts, context);
    }
}
