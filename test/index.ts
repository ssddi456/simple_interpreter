import { assert } from "chai";
import { makeTokenizerContext, toOffset, skipWhiteSpace } from "../parser/tokenizer";

describe('basic', function () {
    it('makeContext', function () {
        assert.deepEqual(makeTokenizerContext(''), {
            content: '',
            pos: {
                line: 0,
                row: 0,
                offset: 0
            }
        }, 'illegal context');
    });

    it('to corrent line', function () {
        const ctx = makeTokenizerContext('11111');

        toOffset(ctx, 4);
        assert.deepEqual(ctx.pos, {
            line: 0,
            row: 4,
            offset: 4
        });
    })

    it('to lineend', function () {
        const ctx = makeTokenizerContext(`11111
`);

        toOffset(ctx, 5);
        assert.deepEqual(ctx.pos, {
            line: 0,
            row: 5,
            offset: 5
        });
    });

    it('to next line', function () {
        const ctx = makeTokenizerContext(`11111
22222`);

        toOffset(ctx, 6);
        assert.deepEqual(ctx.pos, {
            line: 1,
            row: 0,
            offset: 6
        });
    });


    it('to next few line', function () {
        const ctx = makeTokenizerContext(`11111
22222
33333
44444
`);

        toOffset(ctx, 13);
        assert.deepEqual(ctx.pos, {
            line: 2,
            row: 1,
            offset: 13
        });
    });
    it('start from some pos, to next line', function(){
        const ctx = makeTokenizerContext(`11111
22222
33333
44444
`);

        toOffset(ctx, 6);
        toOffset(ctx, 13);
        assert.deepEqual(ctx.pos, {
            line: 2,
            row: 1,
            offset: 13
        });
    });
    it('start from some pos, to next few line', function () {
        const ctx = makeTokenizerContext(`11111
22222
33333
44444
`);

        toOffset(ctx, 6);
        toOffset(ctx, 19);
        assert.deepEqual(ctx.pos, {
            line: 3,
            row: 1,
            offset: 19
        });
    });


    it('skip whitespace 1', function(){
       const ctx = makeTokenizerContext('      1');
       skipWhiteSpace(ctx);
        assert.deepEqual(ctx.pos, {
            line: 0,
            row: 6,
            offset: 6
        });
    });

    it('skip whitespace 2', function () {
        const ctx = makeTokenizerContext('      ');
        skipWhiteSpace(ctx);
        assert.deepEqual(ctx.pos, {
            line: 0,
            row: 6,
            offset: 6
        });
    });
    it('skip whitespace 3', function () {
        const ctx = makeTokenizerContext('111      ');
        skipWhiteSpace(ctx);
        assert.deepEqual(ctx.pos, {
            line: 0,
            row: 0,
            offset: 0
        });
    });
});
