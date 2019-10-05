import PlayerInfo from "./playerInfo";

export default interface LevelInfo {
    id: string;
    startingPhaseTime: number; //in seconds
    chasingPhaseTime: number; //in seconds
    playerInfo: PlayerInfo[];
}