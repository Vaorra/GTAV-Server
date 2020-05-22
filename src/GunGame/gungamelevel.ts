export interface GunGameLevel {
    spawns: Spawn[];
    weapons: string[];
}

export interface Spawn {
    position: Vector3Mp;
    heading: number;
}