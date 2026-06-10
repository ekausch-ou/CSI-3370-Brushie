import { Drawing } from './drawing.js';
import { Snapshot } from './snapshot.js';
import { FileManager } from './file-manager.js';

export class CanvasManager {
    constructor(fileManager = new FileManager()) {
        this.currentDrawing = null;
        this.engine = null;
        this.history = [];
        this.historyIndex = -1;
        this.fileManager = fileManager;
    }

    initialize(engine) {
        this.engine = engine;
    }

    createNewDrawing(settings = {}) {
        this.currentDrawing = new Drawing({
            width: settings.width,
            height: settings.height,
            backgroundColor: settings.backgroundColor || settings.background
        });

        this.engine.setCanvasSize(
            this.currentDrawing.width,
            this.currentDrawing.height
        );

        this.engine.setBackground(
            this.currentDrawing.backgroundColor
        );

        this.engine.clearDrawing();
        this.engine.renderOverlay();

        this.history = [];
        this.historyIndex = -1;
        this.saveState();
    }

    saveState() {
        const snapshot = Snapshot.capture(this.engine);

        // Remove future history if we save after undo
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        this.history.push(snapshot);

        // Limit memory usage
        if (this.history.length > 50) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }

        if (this.history.length === 50) {
            this.historyIndex = this.history.length - 1;
        }
    }

    undo() {
        if (this.historyIndex <= 0) return;
        this.historyIndex--;
        this.history[this.historyIndex].restore(this.engine);
    }

    redo() {
        if (this.historyIndex >= this.history.length - 1) return;
        this.historyIndex++;
        this.history[this.historyIndex].restore(this.engine);
    }

    revertHistory() {
        this.undo();
    }

    advanceHistory() {
        this.redo();
    }

    serializeDrawing() {
        return JSON.stringify({
            version: 1,
            drawing: this.currentDrawing,
            canvas: {
                width: this.engine.drawingCanvas.width,
                height: this.engine.drawingCanvas.height
            },
            image: this.engine.drawingCanvas.toDataURL("image/png")
        });
    }

    deserializeDrawing(data) {
        const project = JSON.parse(data);

        return new Drawing({
            id: project.drawing.id,
            width: project.drawing.width,
            height: project.drawing.height,
            backgroundColor:
                project.drawing.backgroundColor || project.drawing.background,
            elements: project.drawing.elements || []
        });
    }

    saveToFile(options) {
        if (!this.engine) return;

        data = this.serializeDrawing()
        this.fileManager.writeExportFile(data, options)
    }

    async loadFromFile(file) {
        const data = await this.fileManager.readFile(file);
        const project = JSON.parse(data);

        this.currentDrawing = this.deserializeDrawing(data);

        this.engine.setCanvasSize(project.canvas.width, project.canvas.height);
        this.engine.setBackground(this.currentDrawing.backgroundColor);
        this.engine.clearDrawing();
        this.engine.renderOverlay();

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
            this.saveState();
        };
        img.src = project.image;
    }

    saveToFile(options = {}) {
        const data = this.serializeDrawing();
        this.fileManager.writeFile(data, {
            filename: options.filename || "drawing.brush",
            type: "application/json"
        });
    }

    renderImage(options = {}) {
        // Canvas to composite background and drawing (layers in the future)
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = this.engine.drawingCanvas.width;
        exportCanvas.height = this.engine.drawingCanvas.height;

        const ctx = exportCanvas.getContext("2d");

        // Background
        ctx.fillStyle = this.engine.backgroundColor || "#ffffff";
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Drawing layer
        ctx.drawImage(this.engine.drawingCanvas, 0, 0);

        const image = exportCanvas.toDataURL(
            options.format,
            0.90
        );

        return this.fileManager.writeExportFile(image, {
            filename:
                options.filename ||
                `export.${options.format === "jpeg" ? "jpg" : "png"}`
        });
    }
    
    clearHistory() {
        this.history = [];
        this.historyIndex = -1;
    }
}