import Lobby from "./lobby";
import PoliceChase from "../PoliceChase/policechase";

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
    player.call("receiveLobbyData", [lobbies]);
});

mp.events.add("startLobby", (lobbyId: number) => {
    lobbies.forEach((lobby) => {
        if (lobbyId === lobby.getId()) {
            (<any>lobbies[0]).run();
        }
    });
});

mp.events.add("joinLobby", (lobbyId: number, player: PlayerMp) => {
    lobbies.forEach((lobby) => {
        if (lobbyId === lobby.getId()) {
            lobby.join(player);
        }
    });
});

mp.events.add("makeReady", (lobbyId: number, player: PlayerMp) => {
    lobbies.forEach((lobby) => {
        if (lobbyId === lobby.getId()) {
            lobby.makeReady(player);
        }
    });
});

mp.events.add("makeNotReady", (lobbyId: number, player: PlayerMp) => {
    lobbies.forEach((lobby) => {
        if (lobbyId === lobby.getId()) {
            lobby.makeNotReady(player);
        }
    });
});

mp.events.add("leaveLobby", (lobbyId: number, player: PlayerMp) => {
    lobbies.forEach((lobby) => {
        if (lobbyId === lobby.getId()) {
            lobby.leave(player);
        }
    });
});

mp.events.add("playerEnterVehicle", (player: PlayerMp, vehicle: VehicleMp, seat: number) => {
    console.log("De gappian");
});