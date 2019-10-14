export default class Showable {
    protected version: number;

    constructor() {
        this.version = 0;
    }

    nextVersion() {
        this.version += 1;
    }

    getVersion() {
        return this.version;
    }

    getShowable() {
    }
}