import { CanvasEngine } from './core/engine.js';
import { CanvasManager } from './core/manager.js';

import { PencilTool } from './tools/pencil-tool.js';

const backgroundCanvas = document.getElementById('bg-canvas');
const drawingCanvas = document.getElementById('drawing-canvas');
const overlayCanvas = document.getElementById('overlay-canvas');

overlayCanvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

const engine = new CanvasEngine({
    backgroundCanvas,
    drawingCanvas,
    overlayCanvas
});

const canvasManager = new CanvasManager();
canvasManager.initialize(engine);
engine.manager = canvasManager;

window.engine = engine;
window.manager = canvasManager;

// Register Tools
engine.registerTool(new PencilTool());

canvasManager.createNewDrawing();

// Tool Events
document.getElementById('btn-pencil').addEventListener('click', () => {
    if (engine.getActiveTool() === 'pencil') {
        engine.clearTool();
    } else {
        engine.setTool('pencil');
    }
});
