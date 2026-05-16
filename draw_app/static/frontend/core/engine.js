export class CanvasEngine {
    constructor(canvas) {
        this.canvas = canvas;

        this.ctx = canvas.getContext('2d');

        this.tools = {};
        this.activeTool = null;

        this.resizeCanvas();
        this.bindEvents();

        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        this.setupContext();
    }

    setupContext() {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
    }

    setStrokeStyle(color) {
        this.ctx.strokeStyle = color;
    }

    setFillStyle(color) {
        this.ctx.fillStyle = color;
    }

    setLineWidth(width) {
        this.ctx.lineWidth = width;
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    registerTool(tool) {
        this.tools[tool.name] = tool;
    }

    getTool(name) {
        return this.activeTool?.getName() ?? null;
    }

    setTool(name) {
        this.activeTool = this.tools[name];
    }

    clearTool(name) {
        this.activeTool = null;
    }

    getPointerPosition(event) {
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    bindEvents() {
        this.canvas.addEventListener('pointerdown', (event) => {
            if (!this.activeTool) return;

            this.activeTool.onPointerDown(
                this.getPointerPosition(event),
                this
            );
        });

        this.canvas.addEventListener('pointermove', (event) => {
            if (!this.activeTool) return;

            this.activeTool.onPointerMove(
                this.getPointerPosition(event),
                this
            );
        });

        this.canvas.addEventListener('pointerup', (event) => {
            if (!this.activeTool) return;

            this.activeTool.onPointerUp(
                this.getPointerPosition(event),
                this
            );
        });

        this.canvas.addEventListener('pointerleave', (event) => {
            if (!this.activeTool) return;

            this.activeTool.onPointerUp(
                this.getPointerPosition(event),
                this
            );
        });
    }
}