import Participant from "./participant";

export default class Lobby {
    protected mp: Mp;
    protected id: number;
    protected gameMode: string;
    protected running: boolean = false;
    protected participants: Participant[] = [];

    constructor(mp: Mp, id: number, gameMode: string) {
        this.mp = mp;
        this.id = id;
        this.gameMode = gameMode;

        this.mp.events.add({
            "playerEnterCheckpoint": (...args: any[]) => this.fowardIfInLobby(this.onPlayerEnterCheckpoint, args ),
            "playerEnterColshape": (...args: any[]) => this.fowardIfInLobby(this.onPlayerEnterColshape, args),
            "playerDeath": (...args: any[]) => this.fowardIfInLobby(this.onPlayerDeath, args),
            "playerQuit": (...args: any[]) => this.fowardIfInLobby(this.onPlayerQuit, args)
        });
    }

    getId() {
        return this.id;
    }

    isRunning() {
        return this.running;
    }

    getParticipants() {
        return this.participants;
    }

    isParticipant(player: PlayerMp) {
        for (let i = 0; i < this.participants.length; i++) {
            if (this.participants[i].player.id === player.id) {
                return true;
            }
        }
        return false;
    }

    isEveryoneReady(): boolean {
        if (this.participants.length === 0) {
            return false;
        }
        for (let i = 0; i < this.participants.length; i++) {
            if (!this.participants[i].isReady()) {
                return false;
            }
        }
        return true;
    }

    countParticipants() {
        return this.participants.length;
    }

    start() {
        this.running = true;
        this.participants.forEach((participant) => {
            participant.player.dimension = this.id;
        });
    }

    join(player: PlayerMp) {
        this.participants.push(new Participant(player));
    }

    makeReady(player: PlayerMp) {
        for (let i = 0; i < this.participants.length; i++) {
            if (player.id === this.participants[i].player.id) {
                this.participants[i].setReady();
            }
        }
    }

    makeNotReady(player: PlayerMp) {
        for (let i = 0; i < this.participants.length; i++) {
            if (player.id === this.participants[i].player.id) {
                this.participants[i].setNotReady();
            }
        }
    }

    leave(player: PlayerMp) {
        for (let i = 0; i < this.participants.length; i++) {
            if (player.id === this.participants[i].player.id) {
                this.participants.splice(i, 1);
            }
        }
    }

    end() {
        this.running = false;
        this.participants = [];

        this.participants.forEach((participant) => {
            participant.player.dimension = 0;
        });
    }

    fowardIfInLobby(callback: Function, ...args: any) {
        if (args[0].dimension === this.id) {
            callback(args);
        }
    }

    //EVENTS
    onPlayerEnterCheckpoint(checkpoint: CheckpointMp, player: PlayerMp) {
    }

    onPlayerEnterColshape(colshape: ColshapeMp, player: PlayerMp) {
    }

    onPlayerDeath(player: PlayerMp, reason: number, killer: PlayerMp) {
    }

    onPlayerQuit(player: PlayerMp, exitType: string, reason: string) {
    }
}