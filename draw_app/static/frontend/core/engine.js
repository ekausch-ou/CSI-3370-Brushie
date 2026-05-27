export class CanvasEngine {
    constructor({ backgroundCanvas, drawingCanvas, overlayCanvas }) {
        this.backgroundCanvas = backgroundCanvas;
        this.drawingCanvas = drawingCanvas;
        this.overlayCanvas = overlayCanvas;

        this.bgCtx = backgroundCanvas.getContext('2d');
        this.drawCtx = drawingCanvas.getContext('2d', {willReadFrequently: true}); // Convert to array of layers? Possible better options
        this.overlayCtx = overlayCanvas.getContext('2d');

        // Tool
        this.tools = {};
        this.activeTool = null;

        // Color
        this.primaryColor = "#000000";
        this.secondaryColor = "#ffffff";
        this.activeColor = true;

        // Selection
        this.selection = null;
        this.selectionImageData = null;
        this.selectionFloating = null;

        this.setupContexts();
        this.resizeAll();
        this.bindEvents();

        window.addEventListener('resize', () => {
            this.resizeAll();
            this.renderBackground();
            this.renderDrawing();
            this.renderOverlay();
        });
    }

    setupContexts() {
        this.drawCtx.lineCap = 'round';
        this.drawCtx.lineJoin = 'round';
        this.drawCtx.strokeStyle = '#000000';
        this.drawCtx.lineWidth = 2;

        this.overlayCtx.lineCap = 'round';
        this.overlayCtx.lineJoin = 'round';
    }

    resizeAll() { 
        const rect = this.drawingCanvas.getBoundingClientRect();

        // Save content before resizing
        const drawingSnapshot = this.drawingCanvas.width > 0 && this.drawingCanvas.height > 0 
            ? this.drawCtx.getImageData(0, 0, this.drawingCanvas.width, this.drawingCanvas.height) : null;

        // Resize canvases
        [this.backgroundCanvas, this.drawingCanvas, this.overlayCanvas].forEach((canvas) => {
            canvas.width = rect.width;
            canvas.height = rect.height;
        });

        // Reinitialize canvas settings
        this.setupContexts();

        // Restore snapshot
        if (drawingSnapshot) {
            const safeWidth = Math.min(drawingSnapshot.width, this.drawingCanvas.width);
            const safeHeight = Math.min(drawingSnapshot.height, this.drawingCanvas.height);

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = drawingSnapshot.width;
            tempCanvas.height = drawingSnapshot.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(drawingSnapshot, 0, 0);

            this.drawCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
            this.drawCtx.drawImage(tempCanvas, 0, 0, safeWidth, safeHeight); // scale snapshot to new canvas
        }
    }

    registerTool(tool) {
        this.tools[tool.name] = tool;
    }

    setTool(name) {
        this.activeTool = this.tools[name] ?? null;
    }

    clearTool() {
        this.activeTool = null;
    }

    getActiveTool() {
        return this.activeTool?.getName() ?? null;
    }

    getPointerPosition(event) {
        const rect = this.overlayCanvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    bindEvents() {
        this.overlayCanvas.addEventListener('pointerdown', (event) => {
        if (!this.activeTool) return;
            this.overlayCanvas.setPointerCapture?.(event.pointerId);
            this.activeTool.onPointerDown(this.getPointerPosition(event), this, event);
        });

        this.overlayCanvas.addEventListener('pointermove', (event) => {
        if (!this.activeTool) return;
            this.activeTool.onPointerMove(this.getPointerPosition(event), this, event);
        });

        this.overlayCanvas.addEventListener('pointerup', (event) => {
        if (!this.activeTool) return;
            this.activeTool.onPointerUp(this.getPointerPosition(event), this, event);
            this.overlayCanvas.releasePointerCapture?.(event.pointerId);
        });

        this.overlayCanvas.addEventListener('pointerleave', (event) => {
        if (!this.activeTool) return;
            this.activeTool.onPointerUp(this.getPointerPosition(event), this, event);
        });
    }

    setStrokeStyle(color) {
        this.drawCtx.strokeStyle = color;
    }

    setFillStyle(color) {
        this.drawCtx.fillStyle = color;
    }

    setLineWidth(width) {
        this.drawCtx.lineWidth = width;
    }

    clearOverlay() {
        this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    }

    clearDrawing() {
        this.drawCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
    }

    renderBackground() {
        const ctx = this.bgCtx;
        const w = this.backgroundCanvas.width;
        const h = this.backgroundCanvas.height;

        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }

    renderDrawing() {
        if (this.selectionFloating) {
            const { imageData, x, y } = this.selectionFloating;
            this.drawCtx.putImageData(imageData, x, y);
        }
    }

    renderOverlay() {
        this.clearOverlay();

        if (this.selection) {
            this.drawSelectionBox(this.selection);
            this.drawSelectionHandles(this.selection);
        }
    }

    drawSelectionBox(bounds) {
        const ctx = this.overlayCtx;
        ctx.save();
        ctx.strokeStyle = '#2a7fff';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.restore();
    }

    drawSelectionHandles(bounds) {
        const ctx = this.overlayCtx;
        const size = 8;
        const handles = this.getSelectionHandles(bounds);

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2a7fff';
        ctx.lineWidth = 1;

        handles.forEach((h) => {
            ctx.fillRect(h.x - size / 2, h.y - size / 2, size, size);
            ctx.strokeRect(h.x - size / 2, h.y - size / 2, size, size);
        });

        ctx.restore();
    }

    getSelectionHandles(bounds) {
        const { x, y, width, height } = bounds;
        const cx = x + width / 2;
        const cy = y + height / 2;

        return [
            { name: 'nw', x, y },
            { name: 'n', x: cx, y },
            { name: 'ne', x: x + width, y },
            { name: 'e', x: x + width, y: cy },
            { name: 'se', x: x + width, y: y + height },
            { name: 's', x: cx, y: y + height },
            { name: 'sw', x, y: y + height },
            { name: 'w', x, y: cy }
        ];
    }

    pointInRect(point, rect) {
        return (
            point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height
        );
    }

    pointInSelection(point) {
        if (!this.selection) return false;
        return this.pointInRect(point, this.selection);
    }

    getHandleAtPoint(point) {
        if (!this.selection) return null;

        const size = 8;
        const handles = this.getSelectionHandles(this.selection);

        for (const handle of handles) {
            const rect = {
                x: handle.x - size / 2,
                y: handle.y - size / 2,
                width: size,
                height: size
            };

            if (this.pointInRect(point, rect)) {
                return handle.name;
            }
        }

        return null;
    }
}