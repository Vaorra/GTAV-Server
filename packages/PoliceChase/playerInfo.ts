export default interface PlayerInfo {
    playerPosition: Vector3Mp;
    playerSkin: number;
    weaponIds: number[];

    vehiclePos: Vector3Mp;
    vehicleHeading: number;
    vehicleColor1: number;
    vehicleColor2: number;
    vehicleModel: number;
    checkPointPos: Vector3Mp;
}