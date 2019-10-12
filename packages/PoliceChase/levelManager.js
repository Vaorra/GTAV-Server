"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var LevelManager = /** @class */ (function () {
    function LevelManager() {
    }
    LevelManager.getRandomLevel = function () {
        var ids = this.getAllLevelIds();
        var randomIndex = Math.floor(Math.random() * ids.length);
        return this.getLevel(ids[randomIndex]);
    };
    LevelManager.getAllLevelIds = function () {
        return fs_1.default.readdirSync(process.cwd() + "/packages/PoliceChase/levels").map(function (fileName) { return fileName.substring(0, fileName.length - 5); });
    };
    LevelManager.getLevel = function (id) {
        return JSON.parse(fs_1.default.readFileSync(process.cwd() + "/packages/PoliceChase/levels/" + id + ".json").toString());
    };
    return LevelManager;
}());
exports.default = LevelManager;
