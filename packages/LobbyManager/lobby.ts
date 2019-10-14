import Participant from "./participant";
import * as vstatic from "../AdminTools/static";
import { throws } from "assert";
import Showable from "./showable";
import { setInterval } from "timers";

export default class Lobby extends Showable {
    protected id: number;
    protected gameMode: string;
    protected running: boolean = false;
    protected participants: Participant[] = [];

    protected initialized: boolean = false;

    private updateInterval: NodeJS.Timeout;

    constructor(id: number, gameMode: string) {
        super();
        this.id = id;
        this.gameMode = gameMode;

        mp.events.add({
            "playerEnterCheckpoint": (...args: any[]) => this.fowardIfInLobby(this.onPlayerEnterCheckpoint.bind(this), args),
            "playerEnterColshape": (...args: any[]) => this.fowardIfInLobby(this.onPlayerEnterColshape.bind(this), args),
            "playerDeath": (...args: any[]) => this.fowardIfInLobby(this.onPlayerDeath.bind(this), args),
            "playerQuit": (...args: any[]) => this.fowardIfInLobby(this.onPlayerQuit.bind(this), args)
        });

        this.updateInterval = setInterval(this.onUpdate.bind(this),  25); //Updates on 40Hz
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

        this.nextVersion();
    }

    join(player: PlayerMp) {
        this.participants.push(new Participant(player));

        this.nextVersion();
    }

    makeReady(player: PlayerMp) {
        for (let i = 0; i < this.participants.length; i++) {
            if (player.id === this.participants[i].player.id) {
                this.participants[i].setReady();
            }
        }

        this.nextVersion();
    }

    makeNotReady(player: PlayerMp) {
        for (let i = 0; i < this.participants.length; i++) {
            if (player.id === this.participants[i].player.id) {
                this.participants[i].setNotReady();
            }
        }

        this.nextVersion();
    }

    leave(player: PlayerMp) {
        for (let i = 0; i < this.participants.length; i++) {
            if (player.id === this.participants[i].player.id) {
                this.participants.splice(i, 1);
            }
        }

        this.nextVersion();
    }

    end() {
        this.running = false;

        clearInterval(this.updateInterval);

        this.participants.forEach((participant) => {
            let player = participant.player;

            player.removeAllWeapons();
            //TODO Set player model
            player.health = 100;
            player.dimension = 0;
            player.spawn(vstatic.spawnPosition);
        });

        this.participants = [];

        this.updateInterval = null;

        this.nextVersion();
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

    getShowable() {
        return {
            id: this.id,
            gameMode: this.gameMode,
            running: this.running,
            participants: this.participants.map((participant) => {
                return {
                    ready: participant.isReady(),
                    name: participant.player.name,
                }
            })
        };
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