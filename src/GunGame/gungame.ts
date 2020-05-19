import Lobby from "../LobbySystem/lobby";
import GunGameLevel from "./gungamelevel";
import LevelManager from "../LevelSystem/levelManager";

export default class GunGame extends Lobby {
    private levelManager = new LevelManager<GunGameLevel>("PoliceChase/levels");

    constructor(id: number) {
        super(id, "Gun Game");
    }

    run() {
        super.start();
    }

    finish() {
        super.end();
    }
}