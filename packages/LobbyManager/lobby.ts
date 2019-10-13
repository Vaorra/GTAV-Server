import Participant from "./participant";
import { setInterval } from "timers";
import * as vstatic from "../AdminTools/static";
import { throws } from "assert";

export default class Lobby {
    protected id: number;
    protected gameMode: string;
    protected running: boolean = false;
    protected participants: Participant[] = [];

    private updateIntervall: NodeJS.Timeout;

    constructor(id: number, gameMode: string) {
        this.id = id;
        this.gameMode = gameMode;

        mp.events.add({
            "playerEnterCheckpoint": (...args: any[]) => this.fowardIfInLobby(this.onPlayerEnterCheckpoint.bind(this), args),
            "playerEnterColshape": (...args: any[]) => this.fowardIfInLobby(this.onPlayerEnterColshape.bind(this), args),
            "playerDeath": (...args: any[]) => this.fowardIfInLobby(this.onPlayerDeath.bind(this), args),
            "playerQuit": (...args: any[]) => this.fowardIfInLobby(this.onPlayerQuit.bind(this), args)
        });
    }

    getId() {
        return this.id; 
    }

    getGameMode() {
        return this.gameMode;
    }

    getDimension() {
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

        this.updateIntervall = setInterval(() => this.onUpdate.bind(this),  25); //Updates on 40Hz
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
                delete this.participants[i];
            }
        }
    }

    end() {
        this.running = false;

        clearInterval(this.updateIntervall);

        this.participants.forEach((participant) => {
            let player = participant.player;

            player.removeAllWeapons();
            //TODO Set player model
            player.health = 100;
            player.dimension = 0;
            player.spawn(vstatic.spawnPosition);
        });

        this.participants = [];

        this.updateIntervall = null;
    }

    fowardIfInLobby(callback: Function, args: any) {
        if (args[0].dimension === this.id) {
            callback(...args);
        }
    }

    messageAllParticipants(message: string) {
        this.participants.forEach((participant) => {
            participant.player.outputChatBox("[" + this.gameMode + "] " + message);
        });
    }

    messageToParticipant(player: PlayerMp, message: string) {
        player.outputChatBox("[" + this.gameMode + "] " + message);
    }

    //EVENTS
    onPlayerEnterCheckpoint(player: PlayerMp, checkpoint: CheckpointMp) {
    }

    onPlayerEnterColshape(player: PlayerMp, colshape: ColshapeMp) {
    }

    onPlayerDeath(player: PlayerMp, reason: number, killer: PlayerMp) {
    }

    onPlayerQuit(player: PlayerMp, exitType: string, reason: string) {
    }

    onUpdate() {
    }
}