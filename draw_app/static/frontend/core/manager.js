export class CanvasManager {
    constructor() {
        this.currentDrawing = null;
        this.engine = null;
        this.history = [];
        this.redoStack = [];
    }

    initialize(engine) {
        this.engine = engine;
    }

    // Initial new canvas method, needs to integrate with a "new drawing" button/settings dialog
    createNewDrawing(settings = {}) {
        this.currentDrawing = {
            id: crypto.randomUUID(),
            width: settings.width || 800,
            height: settings.height || 600,
            background: settings.background || '#ffffff'
        };

        this.engine.resizeAll();
        this.engine.clearDrawing();
        this.engine.renderBackground();
        this.engine.renderOverlay();

        this.clearHistory();
    }

    saveState(imageData) {
        this.history.push(imageData);
        this.redoStack = [];
    }

    undo() {
        if (this.history.length <= 1) return;

        const current = this.history.pop();
        this.redoStack.push(current);

        return this.history[this.history.length - 1];
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const restored = this.redoStack.pop();
        this.history.push(restored);

        return restored;
    }

    async saveDrawing() {
        const payload = {
            drawing: this.engine.drawingCanvas.toDataURL()
        };

        const response = await fetch('/api/drawings/save/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        return response.json();
    }

    async loadDrawing(id) {
        const response = await fetch(`/api/drawings/${id}/`);
        const data = await response.json();

        const image = new Image();

        image.onload = () => {
            this.engine.drawCtx.clearRect(
                0,
                0,
                this.engine.drawingCanvas.width,
                this.engine.drawingCanvas.height
            );

            this.engine.drawCtx.drawImage(image, 0, 0);
        };

        image.src = data.drawing;
    }

    clearHistory() {
        this.history = [];
        this.redoStack = [];
    }
}