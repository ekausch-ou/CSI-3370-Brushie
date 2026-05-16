import { CanvasEngine } from './core/engine.js';
import { PencilTool } from './tools/pencil-tool.js';

const canvas = document.getElementById('drawing-canvas');

const engine = new CanvasEngine(canvas);

const pencilTool = new PencilTool();

engine.registerTool(pencilTool);

document
    .getElementById('pencil-button')
    .addEventListener('click', () => {
        if (engine.getTool() == 'pencil') {
            engine.clearTool('');
        } else {
            engine.setTool('pencil');
        }
    });