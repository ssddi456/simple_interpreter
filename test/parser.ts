import { parser } from "../parser/parser";
import { assert } from "chai";

describe('parser', function () {
    it('identifier', function () {
        const info = parser('ctx');
        assert.deepEqual(info, {
            type: 'block',
            start: {
                line: 0,
                row: 0,
                offset: 0
            },
            end: {
                line: 0,
                row: 3,
                offset: 3
            },
            children: [{
                type: 'identifier',
                name: 'ctx',
                start: {
                    line: 0,
                    row: 0,
                    offset: 0
                },
                end: {
                    line: 0,
                    row: 3,
                    offset: 3
                },
            }]
        })
    });

    it('value', function () {
        const info = parser('123');
        assert.deepEqual(info, {
            type: 'block',
            start: {
                line: 0,
                row: 0,
                offset: 0
            },
            end: {
                line: 0,
                row: 3,
                offset: 3
            },
            children: [{
                type: 'value',
                value: 123,
                start: {
                    line: 0,
                    row: 0,
                    offset: 0
                },
                end: {
                    line: 0,
                    row: 3,
                    offset: 3
                },
            }]
        })
    });


    it('add', function () {
        const info = parser('123+456');
        assert.deepEqual(info, {
            type: 'block',
            start: {
                line: 0,
                row: 0,
                offset: 0
            },
            end: {
                line: 0,
                row: 7,
                offset: 7
            },
            children: [
                {
                    start: {
                        line: 0,
                        row: 0,
                        offset: 0
                    },
                    end: {
                        line: 0,
                        row: 7,
                        offset: 7
                    },
                    type: 'binary',
                    operator: '+',
                    left: {
                        type: 'value',
                        value: 123,
                        start: {
                            line: 0,
                            row: 0,
                            offset: 0
                        },
                        end: {
                            line: 0,
                            row: 3,
                            offset: 3
                        },
                    },
                    right: {
                        type: 'value',
                        value: 456,
                        start: {
                            line: 0,
                            row: 4,
                            offset: 4
                        },
                        end: {
                            line: 0,
                            row: 7,
                            offset: 7
                        },
                    }
                }

            ]
        })
    });
})