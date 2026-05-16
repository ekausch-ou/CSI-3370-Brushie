import { BaseTool } from './base-tool.js';

export class PencilTool extends BaseTool {
    constructor() {
        super('pencil');

        this.isDrawing = false;
    }

    onPointerDown(position, engine) {
        this.isDrawing = true;

        const ctx = engine.ctx;

        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
    }

    onPointerMove(position, engine) {
        if (!this.isDrawing) return;

        const ctx = engine.ctx;

        ctx.lineTo(position.x, position.y);
        ctx.stroke();
    }

    onPointerUp(position, engine) {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        engine.ctx.closePath();
    }
}