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
Object.defineProperty(exports, "__esModule", { value: true });
var lobby_1 = __importDefault(require("../LobbyManager/lobby"));
var levelManager_1 = __importDefault(require("./levelManager"));
var timers_1 = require("timers");
var notMovingDistanceLimit = 7;
var notMovingSpeedLimit = 1;
var notMovingTimeLimit = 5;
var PoliceChase = /** @class */ (function (_super) {
    __extends(PoliceChase, _super);
    function PoliceChase(mp, id) {
        var _this = _super.call(this, mp, id, "Police Chase") || this;
        _this.chasers = [];
        _this.blips = [];
        _this.ticketSinceTargetStuck = 0; //1 second = 40 ticks
        return _this;
    }
    PoliceChase.prototype.run = function () {
        _super.prototype.start.call(this);
        //Random distribute roles
        var pool = this.participants;
        var randomTargetIndex = Math.floor(Math.random() * pool.length);
        var target = pool[randomTargetIndex].player;
        target.outputChatBox("You are the target");
        pool.splice(randomTargetIndex, 1);
        while (pool.length > 0) {
            var randomChaserIndex = Math.floor(Math.random() * pool.length);
            var chaser = pool[randomChaserIndex].player;
            chaser.outputChatBox("You are a chaser");
            pool.splice(randomChaserIndex, 1);
        }
        //Retrieving level
        this.level = levelManager_1.default.getRandomLevel();
        this.setUpLevel();
    };
    PoliceChase.prototype.finish = function () {
        var _this = this;
        //Delete all cars
        Object.keys(this.vehicles).forEach(function (playerId) {
            _this.vehicles[playerId].destroy();
        });
        //Delete all checkPoints
        Object.keys(this.checkPointColShapes).forEach(function (chaserId) {
            _this.checkPointMarkers[chaserId].destroy();
            _this.checkPointColShapes[chaserId].destroy();
        });
        //Delete all blips
        this.blips.forEach(function (blip) {
            blip.destroy();
        });
        //Teleport all players to the spawn
        this.participants.forEach(function (participant) {
            var player = participant.player;
        });
        _super.prototype.end.call(this);
    };
    PoliceChase.prototype.onPlayerEnterCheckpoint = function (checkpoint, player) {
    };
    PoliceChase.prototype.onPlayerEnterColshape = function (colshape, player) {
    };
    PoliceChase.prototype.onPlayerDeath = function (player, reason, killer) {
    };
    PoliceChase.prototype.onPlayerQuit = function (player, exitType, reason) {
    };
    PoliceChase.prototype.setUpLevel = function () {
        //Equiping target
        var targetInfo = this.level.playerInfo[0];
        var targetVehicle = this.mp.vehicles.new(targetInfo.vehicleModel, targetInfo.vehiclePos, {
            heading: targetInfo.vehicleHeading,
            locked: false,
            engine: true,
            dimension: this.getDimension()
        });
        targetVehicle.setColor(targetInfo.vehicleColor1, targetInfo.vehicleColor2);
        targetVehicle.numberPlate = "ACAB";
        this.vehicles[this.target.id] = targetVehicle;
        this.target.dimension = this.getDimension();
        //TODO set skin
        this.target.giveWeapon(targetInfo.weaponIds, 1000);
        this.target.putIntoVehicle(targetVehicle, -1);
        //Equiping chasers
        for (var i = 0; i < this.chasers.length; i++) {
            var chaserInfo = this.level.playerInfo[i + 1];
            var chaserVehicle = this.mp.vehicles.new(chaserInfo.vehicleModel, chaserInfo.vehiclePos, {
                heading: chaserInfo.vehicleHeading,
                locked: false,
                engine: false,
                dimension: this.getDimension()
            });
            chaserVehicle.setColor(chaserInfo.vehicleColor1, chaserInfo.vehicleColor2);
            chaserVehicle.numberPlate = "Officer " + this.chasers[i].name;
            this.vehicles[this.chasers[i].id] = chaserVehicle;
            this.chasers[i].dimension = this.getDimension();
            //TODO set skin
            this.chasers[i].giveWeapon(chaserInfo.weaponIds, 1000);
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
