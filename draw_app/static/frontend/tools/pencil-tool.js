import { BaseTool } from './base-tool.js';

export class PencilTool extends BaseTool {
    constructor() {
        super('pencil');

        this.isDrawing = false;
    }

    onPointerDown(position, engine, event) {
        if (event.button !== 0 && event.button !== 2) return;
        this.isDrawing = true;

        const ctx = engine.drawCtx;
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

        const ctx = engine.drawCtx;
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
    }

    onPointerUp(position, engine) {
        if (!this.isDrawing) return;

        const ctx = engine.drawCtx;
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
        ctx.closePath();
        
        this.isDrawing = false;

        engine.manager?.saveState();
    }
}