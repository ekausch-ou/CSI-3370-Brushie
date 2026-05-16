export class BaseTool {
    constructor(name) {
        this.name = name;
    }

    getName() {
        return this.name
    }
    onPointerDown(position, engine) {}
    onPointerMove(position, engine) {}
    onPointerUp(position, engine) {}
}