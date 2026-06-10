export class CanvasEngine {
    constructor({ backgroundCanvas, drawingCanvas, overlayCanvas }) {
        this.backgroundCanvas = backgroundCanvas;
        this.drawingCanvas = drawingCanvas;
        this.overlayCanvas = overlayCanvas;

        this.bgCtx = backgroundCanvas.getContext('2d');
        this.drawCtx = drawingCanvas.getContext('2d', {willReadFrequently: true}); // Convert to array of layers? Possible better options
        this.overlayCtx = overlayCanvas.getContext('2d');

        this.manager = null; // CanvasManager will set this when initialized
        // Tool
        this.tools = {};
        this.activeTool = null;

        // Color
        this.primaryColor = "#000000";
        this.secondaryColor = "#ffffff";
        this.activeColor = true;

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

    setCanvasSize(width, height) {
        this.drawingCanvas.style.width = `${width}px`;
        this.drawingCanvas.style.height = `${height}px`;

        this.backgroundCanvas.style.width = `${width}px`;
        this.backgroundCanvas.style.height = `${height}px`;

        this.overlayCanvas.style.width = `${width}px`;
        this.overlayCanvas.style.height = `${height}px`;

        this.resizeAll();
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

    setBackground(color) {
        this.backgroundColor = color;
        this.renderBackground();
    }

    renderBackground() {
        const ctx = this.bgCtx;
        const w = this.backgroundCanvas.width;
        const h = this.backgroundCanvas.height;

        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = this.backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, w, h);
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
}