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
var notMovingTimeLimit = 5; //in seconds
var PoliceChase = /** @class */ (function (_super) {
    __extends(PoliceChase, _super);
    function PoliceChase(id) {
        var _this = _super.call(this, id, "Police Chase") || this;
        _this.chasers = [];
        _this.blips = [];
        _this.vehicles = {};
        _this.checkPoints = {};
        _this.tickSinceTargetStuck = 0; //1 second = 40 ticks
        return _this;
    }
    PoliceChase.prototype.run = function () {
        _super.prototype.start.call(this);
        //Random distribute roles
        var pool = Array.from(this.participants.keys());
        var randomPoolIndex = Math.floor(Math.random() * pool.length);
        this.target = this.participants[pool[randomPoolIndex]].player;
        this.messageToParticipant(this.target, "You are the target");
        pool.splice(randomPoolIndex, 1);
        while (pool.length > 0) {
            randomPoolIndex = Math.floor(Math.random() * pool.length);
            var chaser = this.participants[pool[randomPoolIndex]].player;
            this.messageToParticipant(chaser, "You are a chaser");
            this.chasers.push(chaser);
            pool.splice(randomPoolIndex, 1);
        }
        //Retrieving level
        this.level = levelManager_1.default.getRandomLevel();
        this.setUpLevel();
    };
    PoliceChase.prototype.finish = function () {
        var _this = this;
        _super.prototype.end.call(this);
        clearTimeout(this.startingPhaseTimeout);
        clearTimeout(this.chasingPhaseEndedTimeout);
        //Ensure that hooks are done
        timers_1.setTimeout(function () {
            mp.vehicles.forEachInDimension(_this.getDimension(), function (vehicle) {
                vehicle.destroy();
            });
            mp.checkpoints.forEachInDimension(_this.getDimension(), function (checkPoint) {
                checkPoint.destroy();
            });
            mp.objects.forEachInDimension(_this.getDimension(), function (object) {
                object.destroy();
            });
            _this.level = null;
            _this.target = null;
            _this.chasers = [];
            _this.blips = [];
            _this.vehicles = {};
            _this.checkPoints = {};
            _this.tickSinceTargetStuck = 0;
            _this.startingPhaseTimeout = null;
            _this.chasingPhaseEndedTimeout = null;
        }, 250);
    };
    PoliceChase.prototype.onUpdate = function () {
        var _this = this;
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
        var _loop_1 = function (chaser) {
            if (chaser.vehicle) {
                Object.keys(this_1.checkPoints).forEach(function (key) {
                    if (_this.checkPoints[parseInt(key)].chaserIds.includes(chaser.id)) {
                        chaser.vehicle.engine = false;
                    }
                    else {
                        chaser.vehicle.engine = true;
                    }
                });
            }
        };
        var this_1 = this;
        //Disable engines of police officers not allowed to drive
        for (var _i = 0, _a = this.chasers; _i < _a.length; _i++) {
            var chaser = _a[_i];
            _loop_1(chaser);
        }
        //Blip updating
        for (var _b = 0, _c = this.blips; _b < _c.length; _b++) {
            var blip = _c[_b];
            blip.destroy();
        }
        this.blips = [];
        this.blips.push(mp.blips.new(126, this.target.position, { alpha: 255, color: 49, dimension: this.getDimension(), name: "Suspect", scale: 1 }));
        for (var _d = 0, _e = this.chasers; _d < _e.length; _d++) {
            var chaser = _e[_d];
            this.blips.push(mp.blips.new(60, chaser.position, { alpha: 255, color: 29, dimension: this.getDimension(), name: "Officer " + chaser.name, scale: 1 }));
        }
    };
    PoliceChase.prototype.onPlayerEnterCheckpoint = function (player, checkPoint) {
        if (player.id === this.target.id) {
            delete this.checkPoints[checkPoint.id];
            checkPoint.destroy();
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
        var targetVehicle = mp.vehicles.new(mp.joaat(targetInfo.vehicleModel), targetInfo.vehiclePos, {
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
        //Just for testing
        /*mp.checkpoints.new(2, new mp.Vector3(-1992.44226, -438.390717, 11.7268219), 5, {
            direction: new mp.Vector3(0, 0, 0),
            color: [52, 58, 64, 255],
            visible: true,
            dimension: this.getDimension()
        });*/
        //Equiping chasers
        for (var i = 0; i < this.chasers.length; i++) {
            var chaserInfo = this.level.playerInfo[i + 1];
            var chaser = this.chasers[i];
            var chaserVehicle = mp.vehicles.new(mp.joaat(chaserInfo.vehicleModel), chaserInfo.vehiclePos, {
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
            var checkPoint = mp.checkpoints.new(i + 11, chaserInfo.checkPointPos, 5, {
                direction: new mp.Vector3(0, 0, 0),
                color: [52, 58, 64, 255],
                visible: true,
                dimension: this.getDimension()
            });
            this.checkPoints[checkPoint.id] = { checkPoint: checkPoint, chaserIds: [chaser.id] };
        }
        this.startingPhaseTimeout = timers_1.setTimeout(this.onStartingPhaseEnded, this.level.chasingPhaseTime * 1000);
    };
    PoliceChase.prototype.onStartingPhaseEnded = function () {
        if (Object.keys(this.checkPoints).length === 0) {
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
                if (chaser.vehicle) {
                    var distanceV = chaser.vehicle.position.subtract(this.target.vehicle.position);
                    var velocity = new mp.Vector3(this.target.vehicle.velocity.x, this.target.vehicle.velocity.x, this.target.vehicle.velocity.x);
                    var distance = distanceV.length();
                    var speed = velocity.length();
                    return distance < notMovingDistanceLimit && speed < notMovingSpeedLimit;
                }
            }
        }
        return false;
    };
    return PoliceChase;
}(lobby_1.default));
exports.default = PoliceChase;
