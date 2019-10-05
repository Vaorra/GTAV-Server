"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var vstatic = __importStar(require("./static"));
mp.events.add("playerDeath", function (player) {
    if (player.dimension == 0) {
        player.spawn(vstatic.spawnPosition);
    }
});
mp.events.add("playerJoin", function (player) {
    player.spawn(vstatic.spawnPosition);
    player.outputChatBox(vstatic.prefix + "Welcome on the Vaorra Minigames server!");
    player.name = player.socialClub + " [" + player.id + "]";
    console.log(player.name + " (" + player.ip + ") connected!");
});
mp.events.add("playerQuit", function (player) {
    console.log(player.name + " (" + player.ip + ") disconnected!");
});
