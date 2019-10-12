"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var participant_1 = __importDefault(require("./participant"));
var timers_1 = require("timers");
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
    Lobby.prototype.getGameMode = function () {
        return this.gameMode;
    };
    Lobby.prototype.getDimension = function () {
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
        this.updateIntervall = timers_1.setInterval(this.onUpdate.bind(this), 25); //Updates on 40Hz
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
                delete this.participants[i];
            }
        }
    };
    Lobby.prototype.end = function () {
        clearInterval(this.updateIntervall);
        this.running = false;
        this.participants.forEach(function (participant) {
            participant.player.dimension = 0;
        });
        this.participants = [];
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
    Lobby.prototype.messageAllParticipants = function (message) {
        var _this = this;
        this.participants.forEach(function (participant) {
            participant.player.outputChatBox("[" + _this.gameMode + "] " + message);
        });
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
    Lobby.prototype.onUpdate = function () {
    };
    return Lobby;
}());
exports.default = Lobby;
