import { parser } from "../parser/parser";
import { interpreter } from "../interpreter/interpreter";
import { assert } from 'chai'

describe('interpreter', function () {
    it('number', function () {
        const ast = parser('2');
        const result = interpreter(ast);
        assert.equal(result, 2);
    })

    it('add 1', function () {
        const ast = parser('2 + 1');
        const result = interpreter(ast);
        assert.equal(result, 3);
    });

    it('and 1', function () {
        const ast = parser('2 && 1');
        const result = interpreter(ast);
        assert.equal(result, 1);
    });

    it('and 2', function () {
        const ast = parser('0 && 1');
        const result = interpreter(ast);
        assert.equal(result, 0);
    });

    it('and 3', function () {
        const ast = parser('2 && 0');
        const result = interpreter(ast);
        assert.equal(result, 0);
    });

    it('or 1', function () {
        const ast = parser('2 || 1');
        const result = interpreter(ast);
        assert.equal(result, 2);
    });

    it('or 2', function () {
        const ast = parser('0 || 1');
        const result = interpreter(ast);
        assert.equal(result, 1);
    });

    it('compare 1', function () {
        const ast = parser('0 > 1');
        const result = interpreter(ast);
        assert.equal(result, false);
    });
    
    it('compare 2', function () {
        const ast = parser('1 >= 1');
        const result = interpreter(ast);
        assert.equal(result, true);
    });

    it('simbol 1', function () {
        const ast = parser('a');
        const result = interpreter(ast, { a: 1});
        assert.equal(result, 1);
    });
});
