"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var policechase_1 = __importDefault(require("../PoliceChase/policechase"));
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
    player.call("receiveLobbyData", [lobbies.map(function (lobby) {
            return {
                id: lobby.getId(),
                gameMode: lobby.getGameMode(),
                running: lobby.isRunning(),
                participants: lobby.getParticipants().map(function (participant) {
                    return {
                        name: participant.player.name,
                        ready: participant.isReady()
                    };
                })
            };
        })]);
});
mp.events.add("requestPlayerData", function (player) {
    player.call("receivePlayerData", [{
            lobbyId: (function () {
                var lobby = lobbies.find(function (lobby) {
                    return lobby.isParticipant(player);
                });
                return lobby ? lobby.getId() : null;
            }).call(undefined)
        }]);
});
mp.events.add("startLobby", function (player, lobbyId) {
    lobbies.forEach(function (lobby) {
        if (lobbyId === lobby.getId()) {
            lobbies[0].run();
        }
    });
});
mp.events.add("joinLobby", function (player, lobbyId) {
    lobbies.forEach(function (lobby) {
        if (lobbyId === lobby.getId()) {
            lobby.join(player);
        }
    });
});
mp.events.add("makeReady", function (player, lobbyId) {
    lobbies.forEach(function (lobby) {
        if (lobbyId === lobby.getId()) {
            lobby.makeReady(player);
        }
    });
});
mp.events.add("makeNotReady", function (player, lobbyId) {
    lobbies.forEach(function (lobby) {
        if (lobbyId === lobby.getId()) {
            lobby.makeNotReady(player);
        }
    });
});
mp.events.add("leaveLobby", function (player, lobbyId) {
    lobbies.forEach(function (lobby) {
        if (lobbyId === lobby.getId()) {
            lobby.leave(player);
        }
    });
});
