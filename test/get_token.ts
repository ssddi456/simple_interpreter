import { getToken, makeTokenizerContext, tokenize } from "../parser/tokenizer";
import { assert } from 'chai';
describe('getToken', function () {

    it('will get a if', function () {
        const ctx = makeTokenizerContext('if');
        const { indexOffset, token } = getToken(ctx);

        assert.equal(indexOffset, 2);
        assert.equal(token, 'if');
    });

    it('tokenizer', function () {
        const tokens = tokenize(makeTokenizerContext('ctx'));

        assert.deepEqual(tokens, [{
            content: 'ctx',
            pos: {
                line: 0,
                row: 0,
                offset: 0
            }
        }]);
    })

    it('tokenizer 1', function () {
        const tokens = tokenize(makeTokenizerContext('if ctx != 3'));

        assert.deepEqual(tokens, [{
            content: 'if',
            pos: {
                line: 0,
                row: 0,
                offset: 0
            }
        }, {
            content: 'ctx',
            pos: {
                line: 0,
                row: 3,
                offset: 3
            }
        },
        {
            content: '!=',
            pos: {
                line: 0,
                row: 7,
                offset: 7
            }
        },
        {
            content: '3',
            pos: {
                line: 0,
                row: 10,
                offset: 10
            }
        }]);
    });

    it('tokenizer 2', function () {
        const tokens = tokenize(makeTokenizerContext('ctx(3, 1)'));

        assert.deepEqual(tokens, [{
            content: 'ctx',
            pos: {
                line: 0,
                row: 0,
                offset: 0
            }
        }, {
            content: '(',
            pos: {
                line: 0,
                row: 3,
                offset: 3
            }
        },
        {
            content: '3',
            pos: {
                line: 0,
                row: 4,
                offset: 4
            }
        },
        {
            content: ',',
            pos: {
                line: 0,
                row: 5,
                offset: 5
            }
        },
        {
            content: '1',
            pos: {
                line: 0,
                row: 7,
                offset: 7
            }
        },
        {
            content: ')',
            pos: {
                line: 0,
                row: 8,
                offset: 8
            }
        }]);
    });
});
