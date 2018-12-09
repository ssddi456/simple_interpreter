define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.player_mixin = {
        data: function () {
            return {
                timer: undefined,
                speed: 1000,
                playing: false,
            };
        },
        methods: {
            play: function () {
                this.playing = true;
                this.next();
            },
            next: function () {
                var _this = this;
                this.tick();
                if (this.isFinish()) {
                    this.playing = false;
                    return;
                }
                if (this.playing) {
                    this.timer = setTimeout(function () {
                        _this.next();
                    }, this.speed);
                }
            },
            pause: function () {
                clearTimeout(this.timer);
                this.playing = false;
            },
            restart: function () {
                this.reload();
            }
        }
    };
});
