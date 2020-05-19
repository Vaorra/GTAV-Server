export default interface GunGameLevel {
    spawns: Spawn[];
    weapons: string[];
}

interface Spawn {
    position: Vector3Mp;
    heading: number;
}