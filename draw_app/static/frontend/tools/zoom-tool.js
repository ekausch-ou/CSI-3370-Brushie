export class ZoomTool extends BaseTool {
    constructor() {
        super('zoom');
        this.scale = 1;
    }

    onWheel(event, engine) {
        event.preventDefault();

        const delta = event.deltaY < 0 ? 1.1 : 0.9;
        this.scale *= delta;

        const ctx = engine.drawCtx;
        ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);

        engine.render(); // if you have a render function
    }
}
