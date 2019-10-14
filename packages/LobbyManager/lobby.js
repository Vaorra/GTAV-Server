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
var participant_1 = __importDefault(require("./participant"));
var vstatic = __importStar(require("../AdminTools/static"));
var showable_1 = __importDefault(require("./showable"));
var timers_1 = require("timers");
var Lobby = /** @class */ (function (_super) {
    __extends(Lobby, _super);
    function Lobby(id, gameMode) {
        var _this = _super.call(this) || this;
        _this.running = false;
        _this.participants = [];
        _this.initialized = false;
        _this.id = id;
        _this.gameMode = gameMode;
        mp.events.add({
            "playerEnterCheckpoint": function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _this.fowardIfInLobby(_this.onPlayerEnterCheckpoint.bind(_this), args);
            },
            "playerEnterColshape": function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _this.fowardIfInLobby(_this.onPlayerEnterColshape.bind(_this), args);
            },
            "playerDeath": function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _this.fowardIfInLobby(_this.onPlayerDeath.bind(_this), args);
            },
            "playerQuit": function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _this.fowardIfInLobby(_this.onPlayerQuit.bind(_this), args);
            }
        });
        _this.updateInterval = timers_1.setInterval(_this.onUpdate.bind(_this), 25); //Updates on 40Hz
        return _this;
    }
    Lobby.prototype.nextVersion = function () {
        this.version += 1;
    };
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
    Lobby.prototype.getVersion = function () {
        return this.version;
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
        this.nextVersion();
    };
    Lobby.prototype.join = function (player) {
        this.participants.push(new participant_1.default(player));
        this.nextVersion();
    };
    Lobby.prototype.makeReady = function (player) {
        for (var i = 0; i < this.participants.length; i++) {
            if (player.id === this.participants[i].player.id) {
                this.participants[i].setReady();
            }
        }
        this.nextVersion();
    };
    Lobby.prototype.makeNotReady = function (player) {
        for (var i = 0; i < this.participants.length; i++) {
            if (player.id === this.participants[i].player.id) {
                this.participants[i].setNotReady();
            }
        }
        this.nextVersion();
    };
    Lobby.prototype.leave = function (player) {
        for (var i = 0; i < this.participants.length; i++) {
            if (player.id === this.participants[i].player.id) {
                this.participants.splice(i, 1);
            }
        }
        this.nextVersion();
    };
    Lobby.prototype.end = function () {
        this.running = false;
        clearInterval(this.updateInterval);
        this.participants.forEach(function (participant) {
            var player = participant.player;
            player.removeAllWeapons();
            //TODO Set player model
            player.health = 100;
            player.dimension = 0;
            player.spawn(vstatic.spawnPosition);
        });
        this.participants = [];
        this.updateInterval = null;
        this.nextVersion();
    };
    Lobby.prototype.fowardIfInLobby = function (callback, args) {
        if (args[0].dimension === this.id) {
            callback.apply(void 0, args);
        }
    };
    Lobby.prototype.messageAllParticipants = function (message) {
        var _this = this;
        this.participants.forEach(function (participant) {
            participant.player.outputChatBox("[" + _this.gameMode + "] " + message);
        });
    };
    Lobby.prototype.messageToParticipant = function (player, message) {
        player.outputChatBox("[" + this.gameMode + "] " + message);
    };
    Lobby.prototype.getShowable = function () {
        return {
            id: this.id,
            gameMode: this.gameMode,
            running: this.running,
            participants: this.participants.map(function (participant) {
                return {
                    ready: participant.isReady(),
                    name: participant.player.name,
                };
            })
        };
    };
    //EVENTS
    Lobby.prototype.onPlayerEnterCheckpoint = function (player, checkpoint) {
    };
    Lobby.prototype.onPlayerEnterColshape = function (player, colshape) {
    };
    Lobby.prototype.onPlayerDeath = function (player, reason, killer) {
    };
    Lobby.prototype.onPlayerQuit = function (player, exitType, reason) {
    };
    Lobby.prototype.onUpdate = function () {
    };
    return Lobby;
}(showable_1.default));
exports.default = Lobby;
