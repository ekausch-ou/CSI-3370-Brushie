import { BaseTool } from './base-tool.js';

export class PencilTool extends BaseTool {
    constructor() {
        super('pencil');

        this.isDrawing = false;
        this.lastPoint = null;
    }

    onPointerDown(position, engine, event) {
        console.log("Draw")
        this.isDrawing = true;
        this.lastPoint = position;

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

        this.lastPoint = position;
    }

    onPointerUp(position, engine) {
        if (!this.isDrawing) return;

        const ctx = engine.drawCtx;
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
        ctx.closePath();
        
        this.isDrawing = false;
        this.lastPoint = null;

        engine.manager?.saveState();
    }
}