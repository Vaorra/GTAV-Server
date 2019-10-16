export default class Participant {
    player: PlayerMp;
    private ready: boolean = false;

    constructor(player: PlayerMp) {
        this.player = player;
    }

    setReady() {
        this.ready = true;
    }

    setNotReady() {
        this.ready = false;
    }

    isReady() {
        return this.ready;
    }
}