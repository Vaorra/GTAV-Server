import Lobby from "../LobbySystem/lobby";
import LevelManager from "../LevelSystem/levelManager";
import { GunGameLevel } from "./gungamelevel";
import GunGameStats from "./gungamestats";
import { stat } from "fs";
import { dirname } from "path";

const demotionDeathLimit = 5;

export default class GunGame extends Lobby {
    private levelManager = new LevelManager<GunGameLevel>("GunGame/levels");

    //Setup
    private level: GunGameLevel;

    private stats: { [playerId: number]: GunGameStats} = {};

    private won: boolean;

    constructor(id: number) {
        super(id, "Gun Game");

        this.won = false;
    }

    run() {
        super.start();

        //Retrieving level
        this.level = this.levelManager.getRandomLevel();

        this.participants.forEach((participant, i) => {
            let spawn = this.level.spawns[i];

            participant.player.position = spawn.position;
            participant.player.giveWeapon(mp.joaat(this.level.weapons[0]), 1000);
            this.stats[participant.player.id] = {
                stage: 0,
                deathsDuringStage: 0,
                deaths: 0,
                kills: 0
            };
        });
    }

    finish() {
        super.end();

        this.level = undefined;
        this.stats = {};
        this.won = false;
    }

    onPlayerDeath(player: PlayerMp, reason: number, killer: PlayerMp) {
        if (!this.won) {
            let killedStats = this.stats[player.id];
            killedStats.deaths += 1;
            killedStats.deathsDuringStage += 1;

            // Demote killed player
            if (killedStats.deathsDuringStage >= demotionDeathLimit && killedStats.stage > 0) {
                killedStats.deathsDuringStage = 0;
                killedStats.stage -= 1;

                this.messageToParticipant(player, "You got demoted [Stage " + killedStats.stage + "]");
            }

            player.removeAllWeapons();
            this.respawnPlayer(player);
            player.giveWeapon(mp.joaat(this.level.weapons[killedStats.stage]), 1000);

            if (killer && player.id !== killer.id) {
                let killerStats = this.stats[killer.id];

                killerStats.kills += 1;
                killerStats.deathsDuringStage = 0;
                killerStats.stage += 1;

                killer.health = 100;

                // Player won the game
                if (killerStats.stage === this.level.weapons.length - 1) {

                    this.participants.forEach((participant) => {
                        participant.player.removeAllWeapons();
                    });

                    this.messageAllParticipants(killer.name + " won the gun game!");

                    setTimeout(() => {
                        this.finish();
                    }, 5000);
                } else {
                    killer.removeAllWeapons();

                    setTimeout(() => {
                        killer.giveWeapon(mp.joaat(this.level.weapons[killerStats.stage]), 1000);
                    }, 500);

                    this.messageToParticipant(killer, "You got promoted [Stage " + killerStats.stage + "]");
                }
            }
        }
    }

    private respawnPlayer(player: PlayerMp) {
        let enemyPositions: Vector3Mp[] = [];

        for (let participant of this.participants) {
            if (participant.player.id !== player.id) {
                enemyPositions.push(participant.player.position);
                console.log(participant.player.position);
            }
        }

        let nearestEnemy: number[] = [];

        // Calculate distance to nearest enemy for every spawn
        this.level.spawns.forEach((spawn, i) => {
            enemyPositions.forEach((position) => {
                // Calc distance between enemy and spawn
                let distance = new mp.Vector3(position.x - spawn.position.x, position.y - spawn.position.y, position.z - spawn.position.z).length();

                // If distance is smaller than previous set as new smallest
                if (nearestEnemy.length === i || nearestEnemy[i] > distance) {
                    nearestEnemy[i] = distance;
                }
            });
        });

        let best = 0;
        // Find spawn with most distance
        nearestEnemy.forEach((distance, i) => {
            if (nearestEnemy[best] < distance) {
                best = i;
            }
        });

        let spawn = this.level.spawns[best];
        player.spawn(spawn.position);
        player.heading = spawn.heading;
    }
}
