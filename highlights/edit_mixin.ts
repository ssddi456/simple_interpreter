
export const edit_mixin = {
    data() {
        return {
            mode: 'playing',
            modes: ['edit', 'playing'],
        };
    },
    methods: {
        mapInfo() {
            return JSON.stringify(this.sevenBHContext, null, 2);
        },
        toggleMode() {
            const idx = this.modes.indexOf(this.mode);
            if (idx >= this.modes.length - 1) {
                this.mode = this.modes[0];
            } else {
                this.mode = this.modes[idx + 1];
            }
        }
    }
}