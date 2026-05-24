import { BaseTool } from './base-tool.js';

export class PencilTool extends BaseTool {
    constructor() {
        super('pencil');

        this.isDrawing = false;
    }

    onPointerDown(position, engine, event) {
        this.isDrawing = true;

        const ctx = engine.ctx;

        // LEFT CLICK = primary color
        if (event.button === 0) {
            ctx.strokeStyle = engine.activeColor ? engine.primaryColor : engine.secondaryColor;
        }

        // RIGHT CLICK = secondary color
        if (event.button === 2) {
            ctx.strokeStyle = engine.activeColor ? engine.secondaryColor : engine.primaryColor;
        }

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