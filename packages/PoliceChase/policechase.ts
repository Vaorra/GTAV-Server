import Lobby from "../LobbyManager/lobby";
import PoliceChaseLevel from "./levelInfo";
import Participant from "../LobbyManager/participant";
import LevelManager from "./levelManager";
import { setTimeout } from "timers";
import * as vstatic from "../AdminTools/static";

const notMovingDistanceLimit = 7;
const notMovingSpeedLimit = 1;
const notMovingTimeLimit = 5; //in seconds

export default class PoliceChase extends Lobby {

    private level: PoliceChaseLevel;

    private target: PlayerMp;
    private chasers: PlayerMp[] = [];

    private blips: BlipMp[] = [];

    private vehicles: { [playerId: string]: VehicleMp } = {};
    private checkPointColShapes: { [chaserId: string]: ColshapeMp } = {};
    private checkPointMarkers: { [chaserId: string]: MarkerMp } = {};
    
    private ticketSinceTargetStuck: number = 0; //1 second = 40 ticks

    private startingPhaseTimeout: NodeJS.Timeout;
    private chasingPhaseEndedTimeout: NodeJS.Timeout;
    
    constructor(mp: Mp, id: number) {
        super(mp, id, "Police Chase");
    }

    run() {
        super.start();

        //Random distribute roles
        let pool: Participant[] = this.participants;
        const randomTargetIndex = Math.floor(Math.random() * pool.length);

        this.target = pool[randomTargetIndex].player;
        this.target.outputChatBox("You are the target");
        pool.splice(randomTargetIndex, 1);

        while(pool.length > 0) {
            const randomChaserIndex = Math.floor(Math.random() * pool.length);

            let chaser = pool[randomChaserIndex].player;
            chaser.outputChatBox("You are a chaser");
            this.chasers.push(chaser);
            pool.splice(randomChaserIndex, 1);
        }

        //Retrieving level
        this.level = LevelManager.getRandomLevel();

        this.setUpLevel();
    }

    finish() {
        clearTimeout(this.startingPhaseTimeout);
        clearTimeout(this.chasingPhaseEndedTimeout);

        this.mp.vehicles.forEachInDimension(this.getDimension(), (vehicle) => {
            vehicle.destroy();
        });
        
        this.mp.colshapes.forEachInDimension(this.getDimension(), (colshape) => {
            colshape.destroy();
        });

        this.mp.markers.forEachInDimension(this.getDimension(), (marker) => {
            marker.destroy();
        });

        this.mp.objects.forEachInDimension(this.getDimension(), (object) => {
            object.destroy();
        });

        //Teleport all players to the spawn
        this.participants.forEach(participant => {
            let player = participant.player;

            //TODO Stop the player from spectating

            player.removeAllWeapons();
            //TODO Set player model
            player.health = 100;
            player.dimension = 0;
            player.spawn(vstatic.spawnPosition);
        });

        super.end();
    }

    onUpdate() {
        //Check if target suck
        if (this.isTargetStuck()) {
            if (this.ticketSinceTargetStuck % 40 == 0) {
                this.messageAllParticipants("The target has to move within " + (notMovingTimeLimit - this.ticketSinceTargetStuck / 40) + " seconds!");
            }

            this.ticketSinceTargetStuck += 1;
        }

        else {
            this.ticketSinceTargetStuck = 0;
        }

        //Check if target stuck long enough
        if (this.ticketSinceTargetStuck / 40 > notMovingTimeLimit) {
            //Police won
            this.messageAllParticipants("Police has won: The police managed to stop the target vehicle!");
            this.finish();
        }

        //Disable engines of police officers not allowed to drive
        for (let chaser of this.chasers) {
            if (chaser.vehicle) {
                if (chaser.id in this.checkPointColShapes) {
                    chaser.vehicle.engine = false;
                }
                else {
                    chaser.vehicle.engine = true;
                }
            }
        }

        //Blip updating
        for (let blip of this.blips) {
            blip.destroy();
        }
        this.blips = [];

        this.blips.push(this.mp.blips.new(126, this.target.position, { alpha: 255, color: 49, dimension: this.getDimension(), name: "Suspect", scale: 1 }));

        for (let chaser of this.chasers) {
            this.blips.push(this.mp.blips.new(60, chaser.position, { alpha: 255, color: 29, dimension: this.getDimension(), name: "Officer " + chaser.name, scale: 1 }));
        }
    }

    onPlayerEnterColshape(colshape: ColshapeMp, player: PlayerMp) {
        if (player.id === this.target.id) {
            let chaserId;

            for (let playerId in this.checkPointColShapes) {
                if (colshape.id === this.checkPointColShapes[playerId].id) {
                    chaserId = playerId;
                }
            }

            let marker = this.checkPointMarkers[chaserId];

            delete this.checkPointMarkers[chaserId];
            delete this.checkPointColShapes[chaserId];

            marker.destroy();
            colshape.destroy();
        }
    }

    onPlayerDeath(player: PlayerMp, reason: number, killer: PlayerMp) {
        if (player.id === this.target.id) {
            if (killer) {
                //Police won
                this.messageAllParticipants("Police has won: The target has killed itself!");
            }
            else {
                //Target won
                this.messageAllParticipants("Target has won: It was killed by the police!");
            }

            this.finish();
        }
        else {
            delete this.chasers[this.chasers.indexOf(player)];

            if (this.chasers.length > 0) {
                //TODO Set player to spectate
            }
            else {
                //Target won
                this.messageAllParticipants("Target has won: All police officers have died!");
                this.finish();
            }
        }
    }

    onPlayerQuit(player: PlayerMp, exitType: string, reason: string) {
        this.leave(player);

        if (player.id === this.target.id) {
            let reasonText = "The target has ";

            switch (reason) {
                case "disconnect":
                    reasonText += "left the server!";
                    break;

                case "timeout":
                    reasonText += "timed out!";
                    break;

                case "kicked":
                    reasonText += "been kicked from the server!";
                    break;
            }

            this.messageAllParticipants("Police has won: " + reasonText);
            this.finish();
        }

        else {
            delete this.chasers[this.chasers.indexOf(player)];

            if (this.chasers.length === 0) {
                //Target won
                this.messageAllParticipants("Target has won: There are no police officers left!");
                this.finish();
            }
        }
    }

    setUpLevel() {
        //Equiping target
        let targetInfo = this.level.playerInfo[0];

        let targetVehicle = this.mp.vehicles.new(mp.joaat(targetInfo.vehicleModel), targetInfo.vehiclePos, {
            heading: targetInfo.vehicleHeading,
            locked: false,
            engine: true,
            dimension: this.getDimension()
        });

        targetVehicle.setColor(targetInfo.vehicleColor1, targetInfo.vehicleColor2);
        targetVehicle.numberPlate = "ACAB";
        this.vehicles[this.target.id] = targetVehicle;

        this.target.dimension = this.getDimension();
        this.target.model = targetInfo.playerSkin;
        this.target.giveWeapon(mp.joaat(targetInfo.weaponNames), 1000);
        this.target.putIntoVehicle(targetVehicle, -1);

        //Equiping chasers
        for (let i = 0; i < this.chasers.length; i++) {
            let chaserInfo = this.level.playerInfo[i + 1];

            let chaserVehicle = this.mp.vehicles.new(mp.joaat(chaserInfo.vehicleModel), chaserInfo.vehiclePos, {
                heading: chaserInfo.vehicleHeading,
                locked: false,
                engine: false,
                dimension: this.getDimension()
            });

            chaserVehicle.setColor(chaserInfo.vehicleColor1, chaserInfo.vehicleColor2);
            chaserVehicle.numberPlate = "Officer " + this.chasers[i].name;
            this.vehicles[this.chasers[i].id] = chaserVehicle;

            this.chasers[i].dimension = this.getDimension();
            this.chasers[i].model = chaserInfo.playerSkin;
            this.chasers[i].giveWeapon(mp.joaat(chaserInfo.weaponNames), 1000);
            
            if (chaserInfo.playerPosition === null) {
                this.chasers[i].putIntoVehicle(chaserVehicle, -1);
            }
            else {
                this.chasers[i].position = chaserInfo.playerPosition;
            }

            //Spawning Markers and Colliders
            let colshape = this.mp.colshapes.newTube(chaserInfo.checkPointPos.x, chaserInfo.checkPointPos.y, chaserInfo.checkPointPos.z, 5, 10);
            colshape.dimension = this.getDimension();
            this.checkPointColShapes[this.chasers[i].id] = colshape;

            let marker = this.mp.markers.new(i + 11, chaserInfo.checkPointPos, 5, {
                color: [52, 58, 64, 255],
                dimension: this.getDimension()
            });

            this.checkPointMarkers[this.chasers[i].id] = marker;
        }

        this.startingPhaseTimeout = setTimeout(this.onStartingPhaseEnded, this.level.chasingPhaseTime * 1000);
    }

    onStartingPhaseEnded() {
        if (Object.keys(this.checkPointColShapes).length === 0) {
            this.chasingPhaseEndedTimeout = setTimeout(this.onChasingPhaseEnded, this.level.chasingPhaseTime * 1000);
        }
        else {
            //Police won
            this.messageAllParticipants("The police has won: The target didn't manage to reach all the checkpoints in the given time!");
            this.finish();
        }
    }

    onChasingPhaseEnded() {
        //Target won
        this.messageAllParticipants("The target has won: The police didn't manage to catch the target!");
        this.finish();
    }

    isTargetStuck(): boolean {
        if (this.target.vehicle) {
            for (let chaser of this.chasers) {
                if (chaser.vehicle && chaser.vehicle.position.subtract(this.target.vehicle.position).length() < notMovingDistanceLimit && this.target.vehicle.velocity.length() < notMovingSpeedLimit){
                    return true;
                }
            }
        }
        return false;
    }
}