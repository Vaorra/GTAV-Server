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
    private checkPoints: { [checkPointId: number]: { checkPoint: CheckpointMp, chaserIds: number[] } } = {};
    
    private tickSinceTargetStuck: number = 0; //1 second = 40 ticks

    private startingPhaseTimeout: NodeJS.Timeout;
    private chasingPhaseEndedTimeout: NodeJS.Timeout;

    private isLevelSetup: boolean = false;
    
    constructor(id: number) {
        super(id, "Police Chase");
    }

    run() {
        super.start();

        //Random distribute roles
        let pool = Array.from(this.participants.keys());
        let randomPoolIndex = Math.floor(Math.random() * pool.length);

        this.target = this.participants[pool[randomPoolIndex]].player;
        this.messageToParticipant(this.target, "You are the target");
        pool.splice(randomPoolIndex, 1);

        while(pool.length > 0) {
            randomPoolIndex = Math.floor(Math.random() * pool.length);

            let chaser = this.participants[pool[randomPoolIndex]].player;
            this.messageToParticipant(chaser, "You are a chaser");
            this.chasers.push(chaser);
            pool.splice(randomPoolIndex, 1);
        }

        //Retrieving level
        this.level = LevelManager.getRandomLevel();

        this.setUpLevel();
    }

    finish() {
        super.end();

        clearTimeout(this.startingPhaseTimeout);
        clearTimeout(this.chasingPhaseEndedTimeout);

        //Ensure that hooks are done
        setTimeout(() => {
            mp.vehicles.forEachInDimension(this.getDimension(), (vehicle) => {
                vehicle.destroy();
            });
            
            mp.checkpoints.forEachInDimension(this.getDimension(), (checkPoint) => {
                checkPoint.destroy();
            });
    
            mp.objects.forEachInDimension(this.getDimension(), (object) => {
                object.destroy();
            });

            mp.blips.forEachInDimension(this.getDimension(), (blip) => {
                blip.destroy();
            });
    
            this.level = null;
    
            this.target = null;
            this.chasers = [];
            
            this.blips = [];
    
            this.vehicles = {};
            this.checkPoints = {};
    
            this.tickSinceTargetStuck = 0;
    
            this.startingPhaseTimeout = null;
            this.chasingPhaseEndedTimeout = null;

            this.isLevelSetup = false;
        }, 250);
    }

    onUpdate() {
        if (this.isLevelSetup) {

            //Check if target suck
            if (this.isTargetStuck()) {
                if (this.tickSinceTargetStuck % 40 == 0) {
                    this.messageAllParticipants("The target has to move within " + (notMovingTimeLimit - this.tickSinceTargetStuck / 40) + " seconds!");
                }

                this.tickSinceTargetStuck += 1;
            }

            else {
                this.tickSinceTargetStuck = 0;
            }

            //Check if target stuck long enough
            if (this.tickSinceTargetStuck / 40 > notMovingTimeLimit) {
                //Police won
                this.messageAllParticipants("Police has won: The police managed to stop the target vehicle!");
                this.finish();
            }

            //Disable engines of police officers not allowed to drive
            chaserLoop:
            for (let chaser of this.chasers) {
                if (chaser.vehicle) {
                    for (let key in this.checkPoints) {
                        if (this.checkPoints[parseInt(key)].chaserIds.includes(chaser.id)) {
                            chaser.vehicle.engine = false;
                            continue chaserLoop;
                        }
                    }

                    chaser.vehicle.engine = true;
                }
            }

            //Blip updating
            for (let blip of this.blips) {
                blip.destroy();
            }
            this.blips = [];

            this.blips.push(mp.blips.new(126, this.target.position, { alpha: 255, color: 49, dimension: this.getDimension(), name: "Suspect", scale: 1 }));

            for (let chaser of this.chasers) {
                this.blips.push(mp.blips.new(60, chaser.position, { alpha: 255, color: 29, dimension: this.getDimension(), name: "Officer " + chaser.name, scale: 1 }));
            }
        }
    }

    onPlayerEnterCheckpoint(player: PlayerMp, checkPoint: CheckpointMp) {
        if (player.id === this.target.id) {
            delete this.checkPoints[checkPoint.id];
            checkPoint.destroy();
        }
    }

    onPlayerDeath(player: PlayerMp, reason: number, killer: PlayerMp) {
        if (player.id === this.target.id) {
            if (killer) {
                //Target won
                this.messageAllParticipants("Target has won: It was killed by the police!");
            }
            else {
                //Police won
                this.messageAllParticipants("Police has won: The target has killed itself!");
            }

            this.finish();
        }
        else {
            this.chasers.splice(this.chasers.indexOf(player), 1);

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

        let targetVehicle = mp.vehicles.new(mp.joaat(targetInfo.vehicleModel), targetInfo.vehiclePos, {
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
            let chaser = this.chasers[i];

            let chaserVehicle = mp.vehicles.new(mp.joaat(chaserInfo.vehicleModel), chaserInfo.vehiclePos, {
                heading: chaserInfo.vehicleHeading,
                locked: false,
                engine: false,
                dimension: this.getDimension()
            });

            chaserVehicle.setColor(chaserInfo.vehicleColor1, chaserInfo.vehicleColor2);
            chaserVehicle.numberPlate = "Officer " + chaser.name;
            this.vehicles[chaser.id] = chaserVehicle;

            chaser.dimension = this.getDimension();
            chaser.model = chaserInfo.playerSkin;
            chaser.giveWeapon(mp.joaat(chaserInfo.weaponNames), 1000);
            
            if (chaserInfo.playerPosition === null) {
                chaser.putIntoVehicle(chaserVehicle, -1);
            }
            else {
                chaser.position = chaserInfo.playerPosition;
            }

            let checkPoint = mp.checkpoints.new(i + 11, chaserInfo.checkPointPos, 5, {
                direction: new mp.Vector3(0, 0, 0),
                color: [52, 58, 64, 255],
                visible: true,
                dimension: this.getDimension()
            });

            this.checkPoints[checkPoint.id] = { checkPoint: checkPoint, chaserIds: [chaser.id]};
        }

        this.startingPhaseTimeout = setTimeout(this.onStartingPhaseEnded, this.level.chasingPhaseTime * 1000);

        this.isLevelSetup = true;
    }

    onStartingPhaseEnded() {
        if (Object.keys(this.checkPoints).length === 0) {
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
                if (chaser.vehicle){
                    let distanceV = chaser.vehicle.position.subtract(this.target.vehicle.position);
                    let velocity = new mp.Vector3(this.target.vehicle.velocity.x, this.target.vehicle.velocity.x, this.target.vehicle.velocity.x);

                    let distance = distanceV.length();
                    let speed = velocity.length();

                    if (distance < notMovingDistanceLimit && speed < notMovingSpeedLimit) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}