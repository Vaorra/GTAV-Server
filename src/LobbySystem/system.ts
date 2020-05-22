import Lobby from "./lobby";
import PoliceChase from "../PoliceChase/policechase";
import Participant from "./participant";
import GunGame from "../GunGame/gungame";

let lobbies: Lobby[] = [];

//Test Population
lobbies.push(new PoliceChase(1));
lobbies.push(new GunGame(2));

setInterval(() => {
    lobbies.forEach((lobby) => {
        if (!lobby.isRunning() && lobby.isEveryoneReady()) {
            lobby.run();
        }
    });
}, 1000);

mp.events.add("requestLobbyVersions", (player: PlayerMp) => {
    player.call("receiveLobbyVersions", [lobbies.map((lobby) => {
        return {
            lobbyId: lobby.getId(),
            lobbyVersion: lobby.getVersion()
        };
    })]);
});

mp.events.add("requestLobbyData", (player: PlayerMp, lobbyId: number) => {
    player.call("receiveLobbyData", [lobbies.find((lobby) => {
        return lobby.getId() === lobbyId;
    }).getShowable()]);
});

mp.events.add("requestPlayerData", (player: PlayerMp) => {
    let lobby = lobbies.find((lobby: Lobby) => {
        return lobby.isParticipant(player);
    });

    if (lobby) {
        let isReady = lobby.getParticipants().find((participant: Participant) => {
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
})

mp.events.add("startLobby", (player: PlayerMp, lobbyId: number) => {
    lobbies.forEach((lobby) => {
        if (lobbyId === lobby.getId()) {
            lobbies[0].run();
        }
    });
});

mp.events.add("joinLobby", (player: PlayerMp, lobbyId: number) => {
    lobbies.forEach((lobby) => {
        if (lobbyId === lobby.getId()) {
            lobby.join(player);
        }
    });
});

mp.events.add("makeReady", (player: PlayerMp, lobbyId: number) => {
    lobbies.forEach((lobby) => {
        if (lobbyId === lobby.getId()) {
            lobby.makeReady(player);
        }
    });
});

mp.events.add("makeNotReady", (player: PlayerMp, lobbyId: number) => {
    lobbies.forEach((lobby) => {
        if (lobbyId === lobby.getId()) {
            lobby.makeNotReady(player);
        }
    });
});

mp.events.add("leaveLobby", (player: PlayerMp, lobbyId: number) => {
    lobbies.forEach((lobby) => {
        if (lobbyId === lobby.getId()) {
            lobby.leave(player);
        }
    });
});