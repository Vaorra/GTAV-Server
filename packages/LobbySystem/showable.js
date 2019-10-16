"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Showable = /** @class */ (function () {
    function Showable() {
        this.version = 0;
    }
    Showable.prototype.nextVersion = function () {
        this.version += 1;
    };
    Showable.prototype.getVersion = function () {
        return this.version;
    };
    Showable.prototype.getShowable = function () {
    };
    return Showable;
}());
exports.default = Showable;
