import Lobby from "./lobby";
import PoliceChase from "../PoliceChase/policechase";
import Participant from "./participant";

let lobbies: Lobby[] = [];

//Test Population
lobbies.push(new PoliceChase(mp, 1));

setInterval(() => {
    lobbies.forEach((lobby) => {
        if (!lobby.isRunning() && lobby.isEveryoneReady()) {
            (<any>lobby).run();
        }
    });
}, 1000);

mp.events.add("requestLobbyData", (player: PlayerMp) => {
    player.call("receiveLobbyData", [lobbies.map(lobby => {
        return {
            id: lobby.getId(),
            gameMode: lobby.getGameMode(),
            running: lobby.isRunning(),
            participants: lobby.getParticipants().map(participant => {
                return {
                    name: participant.player.name,
                    ready: participant.isReady()
                };
            })
        };
    })]);
});

mp.events.add("requestPlayerData", (player: PlayerMp) => {
    let lobby = lobbies.find((lobby: Lobby) => {
        return lobby.isParticipant(player);
    });

    let isReady = lobby.getParticipants().find((participant: Participant) => {
        return participant.player.id === player.id;
    }).isReady();

    player.call("receivePlayerData", [{
        lobbyId: lobby ? lobby.getId() : null,
        isReady: isReady,
    }]);
})

mp.events.add("startLobby", (player: PlayerMp, lobbyId: number) => {
    lobbies.forEach((lobby) => {
        if (lobbyId === lobby.getId()) {
            (<any>lobbies[0]).run();
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