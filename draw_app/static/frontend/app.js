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

// Zoom w/ Mouse Wheel
overlayCanvas.addEventListener('wheel', (event) => {
    event.preventDefault();

    const zoomFactor = 1.1;
    const newScale = event.deltaY < 0 ? engine.scale * zoomFactor : engine.scale / zoomFactor;

    const rect = overlayCanvas.getBoundingClientRect();
    const origin = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

    engine.zoomTo(newScale, origin);
}, { passive: false });

// Pan with Click/Drag Center Mouse Button
let isPanning = false;
let lastPanPoint = null;

overlayCanvas.addEventListener('mousedown', (event) => {
    if (event.button !== 1) return; // middle mouse only

    event.preventDefault();
    isPanning = true;
    lastPanPoint = { x: event.clientX, y: event.clientY };
});

window.addEventListener('mousemove', (event) => {
    if (!isPanning || !lastPanPoint) return;

    const dx = event.clientX - lastPanPoint.x;
    const dy = event.clientY - lastPanPoint.y;

    engine.pan(dx, dy);

    lastPanPoint = { x: event.clientX, y: event.clientY };
});

window.addEventListener('mouseup', (event) => {
    if (event.button !== 1) return;

    isPanning = false;
    lastPanPoint = null;
});