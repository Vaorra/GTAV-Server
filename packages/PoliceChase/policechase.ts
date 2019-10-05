import Lobby from "../LobbyManager/lobby";
import PoliceChaseLevel from "./levelInfo";
import Participant from "../LobbyManager/participant";

const notMovingDistanceLimit = 7;
const notMovingSpeedLimit = 1;
const notMovingTimeLimit = 5;

export default class PoliceChase extends Lobby {

    private level: PoliceChaseLevel;

    private target: PlayerMp;
    private chasers: PlayerMp[] = [];

    private blips: BlipMp[] = [];

    private vehicles: { [playerId: string]: VehicleMp };
    private checkPointColShapes: { [playerId: string]: ColshapeMp };
    private checkPointMarkers: { [colshapeId: string]: MarkerMp };
    
    private ticketSinceTargetStuck: number = 0; //1 second = 40 ticks
    
    constructor(mp: Mp, id: number) {
        super(mp, id, "Police Chase");
    }

    run() {
        super.start();

        //Random distribute roles
        let pool: Participant[] = this.participants;
        const randomTargetIndex = Math.floor(Math.random() * pool.length);

        let target = pool[randomTargetIndex].player;
        target.outputChatBox("You are the target");
        pool.splice(randomTargetIndex, 1);

        while(pool.length > 0) {
            const randomChaserIndex = Math.floor(Math.random() * pool.length);

            let chaser = pool[randomChaserIndex].player;
            chaser.outputChatBox("You are a chaser");
            pool.splice(randomChaserIndex, 1);
        }

        this.level = PoliceChaseLevel.getRandom();

        this.setUpLevel();
    }

    finish() {
        super.end();
    }

    onPlayerEnterCheckpoint(checkpoint: CheckpointMp, player: PlayerMp) {
    }

    onPlayerEnterColshape(colshape: ColshapeMp, player: PlayerMp) {
    }

    onPlayerDeath(player: PlayerMp, reason: number, killer: PlayerMp) {
    }

    onPlayerQuit(player: PlayerMp, exitType: string, reason: string) {
    }

    setUpLevel() {
        //Equiping target
        PoliceChaseLevel.
    }
}