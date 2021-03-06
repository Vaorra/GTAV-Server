export interface PoliceChaseLevel {
    id: string;
    startingPhaseTime: number; //in seconds
    chasingPhaseTime: number; //in seconds
    playerInfo: PlayerInfo[];
}

export interface PlayerInfo {
    playerPosition: Vector3Mp;
    playerSkin: number;
    weaponNames: string[];

    vehiclePos: Vector3Mp;
    vehicleHeading: number;
    vehicleColor1: number;
    vehicleColor2: number;
    vehicleModel: string;
    checkPointPos: Vector3Mp;
}