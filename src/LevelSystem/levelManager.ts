import fs from "fs";
import PoliceChaseLevel from "../PoliceChase/policechaselevel";

export default class LevelManager<T> {
    private levelsLocation: string;

    constructor(levelsLocation: string) { // format folder1/folder2
        this.levelsLocation = levelsLocation;
    }

    getRandomLevel(): T {
        let ids = this.getAllLevelIds();
        let randomIndex = Math.floor(Math.random() * ids.length);
        return this.getLevel(ids[randomIndex]);
    }

    private getAllLevelIds(): string[] {
        return fs.readdirSync(process.cwd() + "/packages/" + this.levelsLocation).map(fileName => fileName.substring(0, fileName.length - 5));
    }

    private getLevel(id: string): T {
        return JSON.parse(fs.readFileSync(process.cwd() + "/packages/" + this.levelsLocation + "/" + id + ".json").toString());
    }
}