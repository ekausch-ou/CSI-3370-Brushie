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

    createNewDrawing(settings = {}) {
        this.currentDrawing = {
            id: crypto.randomUUID(),
            width: settings.width || 1920,
            height: settings.height || 1080,
            background: settings.background || '#ffffff'
        };

        this.engine.setCanvasSize(
            this.currentDrawing.width,
            this.currentDrawing.height
        );

        this.engine.setBackground(
            this.currentDrawing.background
        );

        this.engine.clearDrawing();
        this.engine.renderOverlay();

        this.clearHistory();

        this.saveState();
    }
    saveState() {
        this.history.push(this.captureState());

        if (this.history.length > 50) { // Limit memory usage
            this.history.shift();
        }

        this.redoStack = [];
    }

    captureState() {
        return this.engine.drawCtx.getImageData(
            0,
            0,
            this.engine.drawingCanvas.width,
            this.engine.drawingCanvas.height
        );
    }

    restoreState(imageData) {
        if (!imageData) return;

        this.engine.clearDrawing();
        this.engine.drawCtx.putImageData(imageData, 0, 0);
    }

    undoState() {
        const state = this.undo();
        if (state) {
            this.restoreState(state);
        }
    }
    
    undo() {
        if (this.history.length <= 1) return;

        const current = this.history.pop();
        this.redoStack.push(current);

        return this.history[this.history.length - 1];
    }

    redoState() {
        const state = this.redo();

        if (state) {
            this.restoreState(state);
        }
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const restored = this.redoStack.pop();
        this.history.push(restored);

        return restored;
    }

    async saveDrawing(options) {
        if (!this.engine) return;

        const project = {
            version: 1,
            drawing: this.currentDrawing,

            canvas: {
                width: this.engine.drawingCanvas.width,
                height: this.engine.drawingCanvas.height
            },

            image: this.engine.drawingCanvas.toDataURL("image/png")
        };

        const blob = new Blob(
            [JSON.stringify(project)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = options.filename + ".brush" || "test.brush";
        link.click();

        URL.revokeObjectURL(url);
    }
        
    async loadDrawing(file) {
        const text = await file.text();
        const project = JSON.parse(text);

        this.createNewDrawing(project.drawing);

        const img = new Image();

        img.onload = () => {
            this.engine.clearDrawing();

            this.engine.drawCtx.drawImage(
                img,
                0,
                0,
                project.canvas.width,
                project.canvas.height
            );

            this.clearHistory();
        };

        img.src = project.image;
    }

    clearHistory() {
        this.history = [];
        this.redoStack = [];
    }
}