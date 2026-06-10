export class TextTool extends BaseTool {
    constructor() {
        super('text');
    }

    onPointerDown(position, engine) {
        const text = prompt("Enter text:");
        if (!text) return;

        const ctx = engine.drawCtx;
        ctx.font = engine.textFont ?? "20px sans-serif";
        ctx.fillStyle = engine.primaryColor;
        ctx.fillText(text, position.x, position.y);

        engine.manager?.saveState();
    }
}
