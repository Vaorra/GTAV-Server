"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var participant_1 = __importDefault(require("./participant"));
var Lobby = /** @class */ (function () {
    function Lobby(mp, id, gameMode) {
        var _this = this;
        this.running = false;
        this.participants = [];
        this.mp = mp;
        this.id = id;
        this.gameMode = gameMode;
        this.mp.events.add({
            "playerEnterCheckpoint": function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _this.fowardIfInLobby(_this.onPlayerEnterCheckpoint, args);
            },
            "playerEnterColshape": function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _this.fowardIfInLobby(_this.onPlayerEnterColshape, args);
            },
            "playerDeath": function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _this.fowardIfInLobby(_this.onPlayerDeath, args);
            },
            "playerQuit": function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _this.fowardIfInLobby(_this.onPlayerQuit, args);
            }
        });
    }
    Lobby.prototype.getId = function () {
        return this.id;
    };
    Lobby.prototype.isRunning = function () {
        return this.running;
    };
    Lobby.prototype.getParticipants = function () {
        return this.participants;
    };
    Lobby.prototype.isParticipant = function (player) {
        for (var i = 0; i < this.participants.length; i++) {
            if (this.participants[i].player.id === player.id) {
                return true;
            }
        }
        return false;
    };
    Lobby.prototype.isEveryoneReady = function () {
        if (this.participants.length === 0) {
            return false;
        }
        for (var i = 0; i < this.participants.length; i++) {
            if (!this.participants[i].isReady()) {
                return false;
            }
        }
        return true;
    };
    Lobby.prototype.countParticipants = function () {
        return this.participants.length;
    };
    Lobby.prototype.start = function () {
        var _this = this;
        this.running = true;
        this.participants.forEach(function (participant) {
            participant.player.dimension = _this.id;
        });
    };
    Lobby.prototype.join = function (player) {
        this.participants.push(new participant_1.default(player));
    };
    Lobby.prototype.makeReady = function (player) {
        for (var i = 0; i < this.participants.length; i++) {
            if (player.id === this.participants[i].player.id) {
                this.participants[i].setReady();
            }
        }
    };
    Lobby.prototype.makeNotReady = function (player) {
        for (var i = 0; i < this.participants.length; i++) {
            if (player.id === this.participants[i].player.id) {
                this.participants[i].setNotReady();
            }
        }
    };
    Lobby.prototype.leave = function (player) {
        for (var i = 0; i < this.participants.length; i++) {
            if (player.id === this.participants[i].player.id) {
                this.participants.splice(i, 1);
            }
        }
    };
    Lobby.prototype.end = function () {
        this.running = false;
        this.participants = [];
        this.participants.forEach(function (participant) {
            participant.player.dimension = 0;
        });
    };
    Lobby.prototype.fowardIfInLobby = function (callback) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (args[0].dimension === this.id) {
            callback(args);
        }
    };
    //EVENTS
    Lobby.prototype.onPlayerEnterCheckpoint = function (checkpoint, player) {
    };
    Lobby.prototype.onPlayerEnterColshape = function (colshape, player) {
    };
    Lobby.prototype.onPlayerDeath = function (player, reason, killer) {
    };
    Lobby.prototype.onPlayerQuit = function (player, exitType, reason) {
    };
    return Lobby;
}());
exports.default = Lobby;