import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CanvasManager } from '../core/manager.js';

describe('CanvasManager', () => {
    let manager;
    let engine;
    let mockImageData;

    beforeEach(() => {
        manager = new CanvasManager();

        mockImageData = { width: 1920, height: 1080, data: new Uint8ClampedArray(4) };

        // mock engine of CanvasEngine
        engine = {
            drawingCanvas: { width: 1920, height: 1080 },
            drawCtx: {
                getImageData: vi.fn().mockReturnValue(mockImageData),
                putImageData: vi.fn(),
            },
            setCanvasSize: vi.fn(),
            setBackground: vi.fn(),
            clearDrawing: vi.fn(),
            renderOverlay: vi.fn(),
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });


    describe('constructor', () => {
        it('Initializes Default State', () => {
            expect(manager.currentDrawing).toBeNull();
            expect(manager.engine).toBeNull();
            expect(manager.history).toEqual([]);
            expect(manager.redoStack).toEqual([]);
        });
    });


    describe('initialize', () => {
        it('Stores Engine Reference', () => {
            manager.initialize(engine);
            expect(manager.engine).toBe(engine);
        });
    });


    describe('createNewDrawing', () => {
        beforeEach(() => {
            manager.initialize(engine);
        });

        it('Sets Drawing with Default Settings', () => {
            manager.createNewDrawing();
            expect(manager.currentDrawing).not.toBeNull();
            expect(manager.currentDrawing.width).toBe(1920);
            expect(manager.currentDrawing.height).toBe(1080);
            expect(manager.currentDrawing.background).toBe('#ffffff');
        });

        it('Sets Drawing with Custom Settings', () => {
            manager.createNewDrawing({ width: 800, height: 600, background: '#000000' });
            expect(manager.currentDrawing.width).toBe(800);
            expect(manager.currentDrawing.height).toBe(600);
            expect(manager.currentDrawing.background).toBe('#000000');
        });

        it('Calls Engine Setup Methods', () => {
            manager.createNewDrawing();
            expect(engine.setCanvasSize).toHaveBeenCalledWith(1920, 1080);
            expect(engine.setBackground).toHaveBeenCalledWith('#ffffff');
            expect(engine.clearDrawing).toHaveBeenCalled();
            expect(engine.renderOverlay).toHaveBeenCalled();
        });

        it('Clears History and Saves Initial State', () => {
            manager.history = [mockImageData, mockImageData];
            manager.redoStack = [mockImageData];

            manager.createNewDrawing();

            expect(manager.history).toHaveLength(1); // only the saveState() call
            expect(manager.redoStack).toHaveLength(0);
        });

        it('Assigns a Unique ID to Each Drawing', () => {
            manager.createNewDrawing();
            const id1 = manager.currentDrawing.id;
            manager.createNewDrawing();
            const id2 = manager.currentDrawing.id;
            expect(id1).not.toBe(id2);
        });
    });


    describe('saveState', () => {
        beforeEach(() => {
            manager.initialize(engine);
        });

        it('Appends Captured State to History', () => {
            manager.saveState();
            expect(manager.history).toHaveLength(1);
            expect(manager.history[0]).toBe(mockImageData);
        });

        it('Clears Redo Stack on Save', () => {
            manager.redoStack = [mockImageData];
            manager.saveState();
            expect(manager.redoStack).toHaveLength(0);
        });

        it('Caps History at 50 Entries', () => {
            for (let i = 0; i < 55; i++) {
                manager.saveState();
            }
            expect(manager.history).toHaveLength(50);
        });
    });


    describe('undo', () => {
        beforeEach(() => {
            manager.initialize(engine);
        });

        it('Does Nothing with Only One History Entry', () => {
            manager.saveState();
            const result = manager.undo();
            expect(result).toBeUndefined();
            expect(manager.history).toHaveLength(1);
        });

        it('Moves Current State to Redo Stack', () => {
            manager.saveState(); // state 1
            manager.saveState(); // state 2

            manager.undo();

            expect(manager.redoStack).toHaveLength(1);
            expect(manager.history).toHaveLength(1);
        });

        it('Returns the Previous State', () => {
            const firstCapture = { id: 'first' };
            engine.drawCtx.getImageData.mockReturnValueOnce(firstCapture);
            manager.saveState(); // pushes firstCapture

            manager.saveState(); // pushes a second state
            const result = manager.undo();

            expect(result).toBe(firstCapture);
        });
    });


    describe('redo', () => {
        beforeEach(() => {
            manager.initialize(engine);
        });

        it('Does Nothing with Empty Redo Stack', () => {
            const result = manager.redo();
            expect(result).toBeUndefined();
        });

        it('Restores State from Redo Stack', () => {
            manager.saveState();
            manager.saveState();
            manager.undo();

            expect(manager.redoStack).toHaveLength(1);
            manager.redo();
            expect(manager.redoStack).toHaveLength(0);
            expect(manager.history).toHaveLength(2);
        });

        it('Returns the Restored State', () => {
            const redoState = { id: 'redo' };
            manager.redoStack = [redoState];

            const result = manager.redo();
            expect(result).toBe(redoState);
        });
    });


    describe('undoState', () => {
        beforeEach(() => {
            manager.initialize(engine);
        });

        it('Calls restoreState when Undo is Available', () => {
            manager.saveState();
            manager.saveState();

            manager.undoState();

            expect(engine.clearDrawing).toHaveBeenCalled();
            expect(engine.drawCtx.putImageData).toHaveBeenCalled();
        });

        it('Does Not Call restoreState when Nothing to Undo', () => {
            manager.saveState(); // only 1 entry — undo() returns undefined
            manager.undoState();
            expect(engine.drawCtx.putImageData).not.toHaveBeenCalled();
        });
    });

    describe('redoState', () => {
        beforeEach(() => {
            manager.initialize(engine);
        });

        it('Calls restoreState when Redo is Available', () => {
            manager.saveState();
            manager.saveState();
            manager.undo();
            manager.redoState();

            expect(engine.drawCtx.putImageData).toHaveBeenCalled();
        });

        it('Does Not Call restoreState when Nothing to Redo', () => {
            manager.redoState();
            expect(engine.drawCtx.putImageData).not.toHaveBeenCalled();
        });
    });


    describe('restoreState', () => {
        beforeEach(() => {
            manager.initialize(engine);
        });

        it('Clears Drawing and Puts Image Data', () => {
            manager.restoreState(mockImageData);
            expect(engine.clearDrawing).toHaveBeenCalledOnce();
            expect(engine.drawCtx.putImageData).toHaveBeenCalledWith(mockImageData, 0, 0);
        });

        it('Does Nothing when imageData is Null', () => {
            manager.restoreState(null);
            expect(engine.clearDrawing).not.toHaveBeenCalled();
            expect(engine.drawCtx.putImageData).not.toHaveBeenCalled();
        });
    });


    describe('clearHistory', () => {
        it('Empties History and Redo Stack', () => {
            manager.history = [mockImageData, mockImageData];
            manager.redoStack = [mockImageData];

            manager.clearHistory();

            expect(manager.history).toEqual([]);
            expect(manager.redoStack).toEqual([]);
        });
    });


    describe('Lifecycle Tests', () => {
        it('Full Undo/Redo Cycle Preserves State Sequence', () => {
            manager.initialize(engine);

            const state1 = { label: 'state1' };
            const state2 = { label: 'state2' };
            const state3 = { label: 'state3' };

            engine.drawCtx.getImageData
                .mockReturnValueOnce(state1)
                .mockReturnValueOnce(state2)
                .mockReturnValueOnce(state3);

            manager.saveState(); // history: [state1]
            manager.saveState(); // history: [state1, state2]
            manager.saveState(); // history: [state1, state2, state3]

            expect(manager.undo()).toBe(state2); // pops state3 to redo, returns state2
            expect(manager.undo()).toBe(state1); // pops state2 to redo, returns state1
            expect(manager.redoStack).toHaveLength(2);

            expect(manager.redo()).toBe(state2); // pops state2 from redo, pushes back
            expect(manager.history).toHaveLength(2);
            expect(manager.redoStack).toHaveLength(1);
        });
    });
});