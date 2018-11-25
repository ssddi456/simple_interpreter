import { Ast, JumpTable, AstIdentifier, AstBinary, AstJump, AstIf, AstCall } from "../parser/parser_with_jump";
import { AstExpression } from "../parser/parser";

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

export function loadSevenBHContext(context: SevenBHContext): SevenBHContext {
    context.map.forEach(x => x.forEach(y => {
        switch (y.type) {
            case SevenBHMapMaker.worker:
                const worker = makeSevenBHWorker();
                worker.pos = {
                    ...y.pos!
                };
                context.workers.push(worker);
                let floor = (y as any) as SevenBHFloor;
                floor.type = SevenBHMapMaker.floor;
                (floor.has = [] as SevenBHInteractivableObject[]).push(worker);
                break;
            case SevenBHMapMaker.datacube:
                const datacube = makeSevenBHDataCube();
                datacube.pos = {
                    ...y.pos!
                };
                context.datacubes.push(datacube);
                floor = (y as any) as SevenBHFloor;
                floor.type = SevenBHMapMaker.floor;
                (floor.has = [] as SevenBHInteractivableObject[]).push(datacube);
                break;
            case SevenBHMapMaker.floor:
                y.has = [] as SevenBHInteractivableObject[];
            default:
                break;
        }
    }));
    return context;
}

export interface InterpreterContext {
    line: number;
    tokenIndex: number;
    currentToken: Ast | undefined;
    memories: Array<number | SevenBHBaseObject>;
}

export function makeInterpreterContext(): InterpreterContext {
    return {
        line: 0,
        tokenIndex: 0,
        currentToken: undefined,
        memories: []
    };
}


export function getBinaneryValue(ast: AstBinary, context: InterpreterContext, mapContext: SevenBHContext, jumpTable: JumpTable): any {

}
export function getIdentifierValue(ast: AstIdentifier, context: InterpreterContext, mapContext: SevenBHContext, ): any {
    const name = ast.name;
    if (name.indexOf('mem') === 0) {
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

}

export function doJump(ast: AstJump, context: InterpreterContext, jumpTable: JumpTable, ) {

}

export function doCall(ast: AstCall, context: InterpreterContext, mapContext: SevenBHContext) {
    console.log('do call', ast.name);
    const func = ast.name.name;
    const params = ast.params;
    switch (func) {
        case 'step':
            doStepCall(params, context, mapContext);
            break;

        default:
            break;
    }
}

export function doStepCall(params: AstExpression[], context: InterpreterContext, mapContext: SevenBHContext) {
    const actualDirection = params[Math.floor(Math.random() * params.length)];
    const worker = mapContext.workers[0];
    const cell = getValue(actualDirection, context, mapContext, null as any) as SevenBHObject | undefined;
    const currentCell = getDirectionValue('c', mapContext)! as SevenBHFloor;
    console.log(cell);
    if (cell && cell.type == SevenBHMapMaker.floor) {
        cell.has.push(worker);
        currentCell.has.splice(currentCell.has.indexOf(worker), 1);
        worker.pos = { ...cell.pos! };
    }
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

export function interpreter(ast: Ast[], context: InterpreterContext, mapContext: SevenBHContext, jumpTable: JumpTable, ) {
    getCurrentToken(ast, context);

    if (context.currentToken) {
        getValue(context.currentToken, context, mapContext, jumpTable);
        context.currentToken = undefined;
        context.tokenIndex += 1;
        getCurrentToken(ast, context);
    }
}
