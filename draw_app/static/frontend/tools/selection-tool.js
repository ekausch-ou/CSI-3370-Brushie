import { BaseTool } from './base-tool.js';

export class SelectionTool extends BaseTool {
    constructor() {
        super('selection');

        this.mode = null; // 'selecting' | 'moving'
        this.start = null;
        this.end = null;
        this.dragOffset = null;
    }

    onPointerDown(position, engine) {
        const handle = engine.getHandleAtPoint(position);

        if (handle) {
        // resize mode can be added later
        return;
        }

        if (engine.selection && engine.pointInSelection(position) && engine.selectionFloating) {
        this.mode = 'moving';
        this.dragOffset = {
            x: position.x - engine.selection.x,
            y: position.y - engine.selection.y
        };
        return;
        }

        this.mode = 'selecting';
        this.start = position;
        this.end = position;

        engine.selection = null;
        engine.selectionFloating = null;
        engine.clearOverlay();
    }

    onPointerMove(position, engine) {
        if (this.mode === 'selecting') {
        this.end = position;

        const bounds = this.getBounds();
        engine.selection = bounds;
        engine.renderOverlay();
        return;
        }

        if (this.mode === 'moving' && engine.selectionFloating) {
        const x = position.x - this.dragOffset.x;
        const y = position.y - this.dragOffset.y;

        engine.selectionFloating.x = Math.round(x);
        engine.selectionFloating.y = Math.round(y);

        engine.selection = {
            x: engine.selectionFloating.x,
            y: engine.selectionFloating.y,
            width: engine.selectionFloating.imageData.width,
            height: engine.selectionFloating.imageData.height
        };

        engine.clearDrawing();
        engine.renderDrawing();
        engine.renderOverlay();
        }
    }

    onPointerUp(position, engine) {
        if (this.mode === 'selecting') {
        this.end = position;

        const bounds = this.getBounds();
        this.mode = null;

        if (!bounds || bounds.width < 1 || bounds.height < 1) {
            engine.selection = null;
            engine.selectionFloating = null;
            engine.renderOverlay();
            return;
        }

        const imageData = engine.drawCtx.getImageData(
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height
        );

        engine.drawCtx.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);

        engine.selectionFloating = {
            imageData,
            x: bounds.x,
            y: bounds.y
        };

        engine.selection = {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height
        };

        engine.renderDrawing();
        engine.renderOverlay();
        return;
        }

        if (this.mode === 'moving') {
        this.mode = null;
        engine.clearDrawing();
        engine.renderDrawing();
        engine.renderOverlay();
        }
    }

    getBounds() {
        if (!this.start || !this.end) return null;

        const x = Math.min(this.start.x, this.end.x);
        const y = Math.min(this.start.y, this.end.y);
        const width = Math.abs(this.start.x - this.end.x);
        const height = Math.abs(this.start.y - this.end.y);

        return {
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(width),
            height: Math.round(height)
        };
    }
}