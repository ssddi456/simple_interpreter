define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.edit_mixin = {
        data: function () {
            return {
                mode: 'playing',
                modes: ['edit', 'playing']
            };
        },
        methods: {
            mapInfo: function () {
                return JSON.stringify(this.sevenBHContext, null, 2);
            },
            toggleMode: function () {
                var idx = this.modes.indexOf(this.mode);
                if (idx >= this.modes.length - 1) {
                    this.mode = this.modes[0];
                }
                else {
                    this.mode = this.modes[idx + 1];
                }
            }
        }
    };
});
