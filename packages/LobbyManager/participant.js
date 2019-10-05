"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Participant = /** @class */ (function () {
    function Participant(player) {
        this.ready = false;
        this.player = player;
    }
    Participant.prototype.setReady = function () {
        this.ready = true;
    };
    Participant.prototype.setNotReady = function () {
        this.ready = false;
    };
    Participant.prototype.isReady = function () {
        return this.ready;
    };
    return Participant;
}());
exports.default = Participant;
