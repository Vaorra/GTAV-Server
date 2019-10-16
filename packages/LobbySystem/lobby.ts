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

    protected tick: number = 0; //40 ticks = 1 second || 1 tick = 25ms = 0.025 seconds

    private updateInterval: NodeJS.Timeout;

    //Statics
    private static tickRate: number = 40; //in Hz

    constructor(id: number, gameMode: string) {
        super();
        this.id = id;
        this.gameMode = gameMode;

        mp.events.add({
            //SERVER
            "playerEnterCheckpoint": (...args: any[]) => this.fowardIfInLobby(this.onPlayerEnterCheckpoint.bind(this), args),
            "playerEnterColshape": (...args: any[]) => this.fowardIfInLobby(this.onPlayerEnterColshape.bind(this), args),
            "playerDeath": (...args: any[]) => this.fowardIfInLobby(this.onPlayerDeath.bind(this), args),
            "playerQuit": (...args: any[]) => this.fowardIfInLobby(this.onPlayerQuit.bind(this), args),
            //CLIENT
            "playerWeaponShot": (...args: any[]) => this.fowardIfInLobby(this.onPlayerWeaponShot.bind(this), args),
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

    getTime(): number {
        return this.tick / Lobby.tickRate;
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

        this.updateInterval = setInterval(() => {
            this.tick += 1;
            this.onUpdate.call(this);
        }, 1000 / Lobby.tickRate); //Updates on 40Hz
        
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
            player.model = 2841034142;
            player.health = 100;
            player.dimension = 0;
            player.spawn(vstatic.spawnPosition);
        });

        this.participants = [];

        this.tick = 0;
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

    //SERVER
    onPlayerEnterCheckpoint(player: PlayerMp, checkpoint: CheckpointMp) {
    }

    onPlayerEnterColshape(player: PlayerMp, colshape: ColshapeMp) {
    }

    onPlayerDeath(player: PlayerMp, reason: number, killer: PlayerMp) {
    }

    onPlayerQuit(player: PlayerMp, exitType: string, reason: string) {
    }

    //CLIENT
    onPlayerWeaponShot(player: PlayerMp, targetPosition: Vector3Mp, targetEntity: EntityMp) {
    }

    //CUSTOM
    onUpdate() {
    }
}