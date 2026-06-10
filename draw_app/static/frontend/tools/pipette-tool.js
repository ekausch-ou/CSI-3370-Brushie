export class PipetteTool extends BaseTool {
    constructor() {
        super('pipette');
    }

    onPointerDown(position, engine) {
        const ctx = engine.drawCtx;
        const pixel = ctx.getImageData(position.x, position.y, 1, 1).data;

        const hex = "#" + 
            pixel[0].toString(16).padStart(2, '0') +
            pixel[1].toString(16).padStart(2, '0') +
            pixel[2].toString(16).padStart(2, '0');

        engine.primaryColor = hex;
        console.log("Picked color:", hex);
    }
}

