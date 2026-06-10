export class Snapshot {
    constructor(imageData, timestamp = new Date()) {
        this.imageData = imageData;
        this.timestamp = timestamp;
    }

    static capture(engine) {
        const imageData = engine.drawCtx.getImageData(0, 0, engine.drawingCanvas.width, engine.drawingCanvas.height);
        return new Snapshot(imageData);
    }

    restore(engine) {
        engine.clearDrawing();
        engine.drawCtx.putImageData(this.imageData, 0, 0);
        return engine;
    }
}