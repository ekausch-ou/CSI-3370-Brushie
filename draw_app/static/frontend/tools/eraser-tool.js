import { BaseTool } from './base-tool.js';

export class EraserTool extends BaseTool {
    constructor() {
        super('eraser');
        this.isErasing = false;
    }

    onPointerDown(position, engine, event) {
        if (event.button !== 0) return; // only left click erases

        this.isErasing = true;

        const ctx = engine.drawCtx;

        // Switch to erasing mode
        ctx.save(); 
        ctx.globalCompositeOperation = 'destination-out';

        ctx.lineWidth = engine.eraserSize ?? 20; // customizable eraser size
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
    }

    onPointerMove(position, engine) {
        if (!this.isErasing) return;

        const ctx = engine.drawCtx;
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
    }

    onPointerUp(position, engine) {
        if (!this.isErasing) return;

        const ctx = engine.drawCtx;

        ctx.lineTo(position.x, position.y);
        ctx.stroke();
        ctx.closePath();

        // Restore normal drawing mode
        ctx.restore();

        this.isErasing = false;

        engine.manager?.saveState();
    }
}
