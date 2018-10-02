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

    it('if 1', function () {
        const info = parser(`if test
    next`);

        assert.deepEqual(info, {
            type: 'block',
            start: {
                line: 0,
                row: 0,
                offset: 0
            },
            end: {
                line: 1,
                row: 8,
                offset: 16
            },
            children: [{
                type: 'if',
                start: {
                    line: 0,
                    row: 0,
                    offset: 0
                },
                end: {
                    line: 1,
                    row: 8,
                    offset: 16
                },
                expression: {
                    type: 'identifier',
                    start: {
                        line: 0,
                        row: 3,
                        offset: 3
                    },
                    end: {
                        line: 0,
                        row: 7,
                        offset: 7
                    },
                    name: 'test'
                },
                do: {
                    type: 'block',
                    start: {
                        line: 1,
                        row: 4,
                        offset: 12
                    },
                    end: {
                        line: 1,
                        row: 8,
                        offset: 16
                    },
                    children: [{
                        type: 'identifier',
                        start: {
                            line: 1,
                            row: 4,
                            offset: 12
                        },
                        end: {
                            line: 1,
                            row: 8,
                            offset: 16
                        },
                        name: 'next'
                    }]
                }
            }]
        });

    });

    it('if 2', function () {
        const info = parser(`if a+b
    next    
`);

        assert.deepEqual(info, {
            type: 'block',
            start: {
                line: 0,
                row: 0,
                offset: 0
            },
            end: {
                line: 1,
                row: 8,
                offset: 15
            },
            children: [{
                type: 'if',
                start: {
                    line: 0,
                    row: 0,
                    offset: 0
                },
                end: {
                    line: 1,
                    row: 8,
                    offset: 15
                },
                expression: {
                    type: 'binary',
                    start: {
                        line: 0,
                        row: 3,
                        offset: 3
                    },
                    end: {
                        line: 0,
                        row: 6,
                        offset: 6
                    },
                    operator: '+',
                    left: {
                        type: 'identifier',
                        start: {
                            line: 0,
                            row: 3,
                            offset: 3
                        },
                        end: {
                            line: 0,
                            row: 4,
                            offset: 4
                        },
                        name: 'a'
                    },
                    right: {
                        type: 'identifier',
                        start: {
                            line: 0,
                            row: 5,
                            offset: 5
                        },
                        end: {
                            line: 0,
                            row: 6,
                            offset: 6
                        },
                        name: 'b'

                    }
                },
                do: {
                    type: 'block',
                    start: {
                        line: 1,
                        row: 4,
                        offset: 11
                    },
                    end: {
                        line: 1,
                        row: 8,
                        offset: 15
                    },
                    children: [{
                        type: 'identifier',
                        start: {
                            line: 1,
                            row: 4,
                            offset: 11
                        },
                        end: {
                            line: 1,
                            row: 8,
                            offset: 15
                        },
                        name: 'next'
                    }]
                }
            }]
        });
    });
});
