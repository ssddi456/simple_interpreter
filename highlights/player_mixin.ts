

export const player_mixin = {
    data() {
        return {
            timer: undefined,
            speed: 1000,
            playing: false,
        };
    },
    methods: {
        play() {
            this.playing = true;
            this.next();
        },
        next() {
            this.tick();
            if (this.isFinish()) {
                this.playing = false;
                return;
            }
            if (this.playing) {
                this.timer = setTimeout(() => {
                    this.next();
                }, this.speed);
            }
        },
        pause() {
            clearTimeout(this.timer);
            this.playing = false;
        },
        restart() {
            this.reload();
        }
    }
};