import fs from "fs";
import LevelInfo from "./levelInfo";

export default class LevelManager {
    static getRandomLevel(): LevelInfo {
        let ids = this.getAllLevelIds();
        let randomIndex = Math.floor(Math.random() * ids.length);
        return this.getLevel(ids[randomIndex]);
    }

    private static getAllLevelIds(): string[] {
        return fs.readdirSync("levels").map(fileName => fileName.substring(0, fileName.length - 5));
    }

    private static getLevel(id: string): LevelInfo {
        return JSON.parse(fs.readFileSync("levels/" + id + ".json").toString());
    }
}