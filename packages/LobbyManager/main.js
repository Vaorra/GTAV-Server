"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var policechase_1 = __importDefault(require("./policechase"));
var lobbies = [];
//Test Population
lobbies.push(new policechase_1.default(mp, 1));
setInterval(function () {
    lobbies.forEach(function (lobby) {
        if (!lobby.isRunning() && lobby.isEveryoneReady()) {
            lobby.run();
        }
    });
}, 1000);
mp.events.add("requestLobbyData", function (player) {
    player.call("receiveLobbyData", [lobbies]);
});
mp.events.add("startLobby", function (lobbyId) {
    lobbies.forEach(function (lobby) {
        if (lobbyId === lobby.getId()) {
            lobbies[0].run();
        }
    });
});
mp.events.add("joinLobby", function (lobbyId, player) {
    lobbies.forEach(function (lobby) {
        if (lobbyId === lobby.getId()) {
            lobby.join(player);
        }
    });
});
mp.events.add("makeReady", function (lobbyId, player) {
    lobbies.forEach(function (lobby) {
        if (lobbyId === lobby.getId()) {
            lobby.makeReady(player);
        }
    });
});
mp.events.add("makeNotReady", function (lobbyId, player) {
    lobbies.forEach(function (lobby) {
        if (lobbyId === lobby.getId()) {
            lobby.makeNotReady(player);
        }
    });
});
mp.events.add("leaveLobby", function (lobbyId, player) {
    lobbies.forEach(function (lobby) {
        if (lobbyId === lobby.getId()) {
            lobby.leave(player);
        }
    });
});
mp.events.add("playerEnterVehicle", function (player, vehicle, seat) {
    console.log("De gappian");
});
