import { default as Vue, ComponentOptions, } from 'vue/types';
import { ContextMgrMixin } from './context_mgr_mixin';

interface PlayerMixinData {
    timer: number | undefined;
    speed: number;
    playing: boolean;
}
interface PlayerMixinMethods {
    play(this: PlayerMixin): void;
    next(this: PlayerMixin): void;
    pause(this: PlayerMixin): void;
    restart(this: PlayerMixin): void;
}

export type PlayerMixin = PlayerMixinData & PlayerMixinMethods & ContextMgrMixin & Vue;

export const player_mixin: ComponentOptions<PlayerMixin> = {
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