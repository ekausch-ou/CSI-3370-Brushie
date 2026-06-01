export class BaseTool {
    constructor(name) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    onPointerDown(position, engine, event) {}
    onPointerMove(position, engine, event) {}
    onPointerUp(position, engine, event) {}

    updateToolSettings(settings) {
        
    }

}