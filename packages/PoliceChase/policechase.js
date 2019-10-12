"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var lobby_1 = __importDefault(require("../LobbyManager/lobby"));
var levelManager_1 = __importDefault(require("./levelManager"));
var timers_1 = require("timers");
var vstatic = __importStar(require("../AdminTools/static"));
var notMovingDistanceLimit = 7;
var notMovingSpeedLimit = 1;
var notMovingTimeLimit = 5; //in seconds
var PoliceChase = /** @class */ (function (_super) {
    __extends(PoliceChase, _super);
    function PoliceChase(mp, id) {
        var _this = _super.call(this, mp, id, "Police Chase") || this;
        _this.chasers = [];
        _this.blips = [];
        _this.vehicles = {};
        _this.checkPointColShapes = {};
        _this.checkPointMarkers = {};
        _this.ticketSinceTargetStuck = 0; //1 second = 40 ticks
        return _this;
    }
    PoliceChase.prototype.run = function () {
        _super.prototype.start.call(this);
        //Random distribute roles
        var pool = this.participants;
        var randomTargetIndex = Math.floor(Math.random() * pool.length);
        this.target = pool[randomTargetIndex].player;
        this.target.outputChatBox("You are the target");
        pool.splice(randomTargetIndex, 1);
        while (pool.length > 0) {
            var randomChaserIndex = Math.floor(Math.random() * pool.length);
            var chaser = pool[randomChaserIndex].player;
            chaser.outputChatBox("You are a chaser");
            this.chasers.push(chaser);
            pool.splice(randomChaserIndex, 1);
        }
        //Retrieving level
        this.level = levelManager_1.default.getRandomLevel();
        this.setUpLevel();
    };
    PoliceChase.prototype.finish = function () {
        clearTimeout(this.startingPhaseTimeout);
        clearTimeout(this.chasingPhaseEndedTimeout);
        this.mp.vehicles.forEachInDimension(this.getDimension(), function (vehicle) {
            vehicle.destroy();
        });
        this.mp.colshapes.forEachInDimension(this.getDimension(), function (colshape) {
            colshape.destroy();
        });
        this.mp.markers.forEachInDimension(this.getDimension(), function (marker) {
            marker.destroy();
        });
        this.mp.objects.forEachInDimension(this.getDimension(), function (object) {
            object.destroy();
        });
        //Teleport all players to the spawn
        this.participants.forEach(function (participant) {
            var player = participant.player;
            //TODO Stop the player from spectating
            player.removeAllWeapons();
            //TODO Set player model
            player.health = 100;
            player.dimension = 0;
            player.spawn(vstatic.spawnPosition);
        });
        _super.prototype.end.call(this);
    };
    PoliceChase.prototype.onUpdate = function () {
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
        for (var _i = 0, _a = this.chasers; _i < _a.length; _i++) {
            var chaser = _a[_i];
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
        for (var _b = 0, _c = this.blips; _b < _c.length; _b++) {
            var blip = _c[_b];
            blip.destroy();
        }
        this.blips = [];
        this.blips.push(this.mp.blips.new(126, this.target.position, { alpha: 255, color: 49, dimension: this.getDimension(), name: "Suspect", scale: 1 }));
        for (var _d = 0, _e = this.chasers; _d < _e.length; _d++) {
            var chaser = _e[_d];
            this.blips.push(this.mp.blips.new(60, chaser.position, { alpha: 255, color: 29, dimension: this.getDimension(), name: "Officer " + chaser.name, scale: 1 }));
        }
    };
    PoliceChase.prototype.onPlayerEnterColshape = function (colshape, player) {
        if (player.id === this.target.id) {
            var chaserId = void 0;
            for (var playerId in this.checkPointColShapes) {
                if (colshape.id === this.checkPointColShapes[playerId].id) {
                    chaserId = playerId;
                }
            }
            var marker = this.checkPointMarkers[chaserId];
            delete this.checkPointMarkers[chaserId];
            delete this.checkPointColShapes[chaserId];
            marker.destroy();
            colshape.destroy();
        }
    };
    PoliceChase.prototype.onPlayerDeath = function (player, reason, killer) {
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
    };
    PoliceChase.prototype.onPlayerQuit = function (player, exitType, reason) {
        this.leave(player);
        if (player.id === this.target.id) {
            var reasonText = "The target has ";
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
    };
    PoliceChase.prototype.setUpLevel = function () {
        //Equiping target
        var targetInfo = this.level.playerInfo[0];
        var targetVehicle = this.mp.vehicles.new(mp.joaat(targetInfo.vehicleModel), targetInfo.vehiclePos, {
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
        for (var i = 0; i < this.chasers.length; i++) {
            var chaserInfo = this.level.playerInfo[i + 1];
            var chaserVehicle = this.mp.vehicles.new(mp.joaat(chaserInfo.vehicleModel), chaserInfo.vehiclePos, {
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
            var colshape = this.mp.colshapes.newTube(chaserInfo.checkPointPos.x, chaserInfo.checkPointPos.y, chaserInfo.checkPointPos.z, 5, 10);
            colshape.dimension = this.getDimension();
            this.checkPointColShapes[this.chasers[i].id] = colshape;
            var marker = this.mp.markers.new(i + 11, chaserInfo.checkPointPos, 5, {
                color: [52, 58, 64, 255],
                dimension: this.getDimension()
            });
            this.checkPointMarkers[this.chasers[i].id] = marker;
        }
        this.startingPhaseTimeout = timers_1.setTimeout(this.onStartingPhaseEnded, this.level.chasingPhaseTime * 1000);
    };
    PoliceChase.prototype.onStartingPhaseEnded = function () {
        if (Object.keys(this.checkPointColShapes).length === 0) {
            this.chasingPhaseEndedTimeout = timers_1.setTimeout(this.onChasingPhaseEnded, this.level.chasingPhaseTime * 1000);
        }
        else {
            //Police won
            this.messageAllParticipants("The police has won: The target didn't manage to reach all the checkpoints in the given time!");
            this.finish();
        }
    };
    PoliceChase.prototype.onChasingPhaseEnded = function () {
        //Target won
        this.messageAllParticipants("The target has won: The police didn't manage to catch the target!");
        this.finish();
    };
    PoliceChase.prototype.isTargetStuck = function () {
        if (this.target.vehicle) {
            for (var _i = 0, _a = this.chasers; _i < _a.length; _i++) {
                var chaser = _a[_i];
                if (chaser.vehicle && chaser.vehicle.position.subtract(this.target.vehicle.position).length() < notMovingDistanceLimit && this.target.vehicle.velocity.length() < notMovingSpeedLimit) {
                    return true;
                }
            }
        }
        return false;
    };
    return PoliceChase;
}(lobby_1.default));
exports.default = PoliceChase;
