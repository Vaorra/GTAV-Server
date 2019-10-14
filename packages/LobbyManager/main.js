"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var policechase_1 = __importDefault(require("../PoliceChase/policechase"));
var lobbies = [];
//Test Population
lobbies.push(new policechase_1.default(1));
setInterval(function () {
    lobbies.forEach(function (lobby) {
        if (!lobby.isRunning() && lobby.isEveryoneReady()) {
            lobby.run();
        }
    });
}, 1000);
mp.events.add("requestLobbyVersions", function (player) {
    player.call("receiveLobbyVersions", [lobbies.map(function (lobby) {
            return {
                lobbyId: lobby.getId(),
                lobbyVersion: lobby.getVersion()
            };
        })]);
});
mp.events.add("requestLobbyData", function (player, lobbyId) {
    player.call("receiveLobbyData", [lobbies.find(function (lobby) {
            return lobby.getId() === lobbyId;
        }).getShowable()]);
});
mp.events.add("requestPlayerData", function (player) {
    var lobby = lobbies.find(function (lobby) {
        return lobby.isParticipant(player);
    });
    if (lobby) {
        var isReady = lobby.getParticipants().find(function (participant) {
            return participant.player.id === player.id;
        }).isReady();
        player.call("receivePlayerData", [{
                lobbyId: lobby ? lobby.getId() : null,
                isReady: isReady,
            }]);
    }
    else {
        player.call("receivePlayerData", [{
                lobbyId: lobby ? lobby.getId() : null,
            }]);
    }
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
