import { CanvasEngine } from './core/engine.js';
import { PencilTool } from './tools/pencil-tool.js';

const canvas = document.getElementById('drawing-canvas');

canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

const engine = new CanvasEngine(canvas);
window.engine = engine;

const pencilTool = new PencilTool();

window.engine.registerTool(pencilTool);

document
    .getElementById('btn-pencil')
    .addEventListener('click', () => {
        if (window.engine.getTool() == 'pencil') {
            window.engine.clearTool('');
        } else {
            window.engine.setTool('pencil');
        }
    });