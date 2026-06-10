import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PencilTool } from '../tools/pencil-tool.js';

describe('PencilTool', () => {
    let tool;
    let ctx;
    let engine;

    const position = {x: 10, y: 20};
    const eventLMB = {button: 0}
    const eventRMB = {button: 2}

    beforeEach(() => {
        tool = new PencilTool();

        // drawingCanvas
        ctx = {
            strokeStyle: '',
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            closePath: vi.fn()
        };

        // CanvasEngine
        engine = {
            drawCtx: ctx,
            primaryColor: '#000000',
            secondaryColor: '#ffffff',
            activeColor: true,
            manager: {
                saveState: vi.fn()
            }
        };
    });

    describe('constructor', () => {
        it('Initializes Default State', () => {
            expect(tool.name).toBe('pencil');
            expect(tool.isDrawing).toBe(false);
        });
    });

    describe('onPointerDown', () => {

        it('Start a New Path at Pointer Position', () => {
            tool.onPointerDown(position, engine, eventLMB);

            expect(ctx.beginPath).toHaveBeenCalledOnce();
            expect(ctx.moveTo).toHaveBeenCalledOnce();
            expect(ctx.moveTo).toHaveBeenCalledWith(position.x, position.y);
            expect(tool.isDrawing).toBe(true);
        });

        it('Left Click(activeColor: True): Uses Primary Color ', () => {
            engine.activeColor = true;
            tool.onPointerDown(position, engine, eventLMB);

            expect(ctx.strokeStyle).toBe(engine.primaryColor);
        });

        it('Left Click(activeColor: False): Uses Secondary Color', () => {
            engine.activeColor = false;
            tool.onPointerDown(position, engine, eventLMB);


            expect(ctx.strokeStyle).toBe(engine.secondaryColor);
        });

        it('Right Click(activeColor: True): Uses Secondary Color', () => {
            engine.activeColor = true;
            tool.onPointerDown(position, engine, eventRMB);

            expect(ctx.strokeStyle).toBe(engine.secondaryColor);
        });

        it('Right Click(activeColor: False): Uses Primary Color', () => {
            engine.activeColor = false;
            tool.onPointerDown(position, engine, eventRMB);

            expect(ctx.strokeStyle).toBe(engine.primaryColor);
        });

        it('Do Nothing (Unsupported Buttons)', () => {
            tool.onPointerDown(position, engine, {button: 1});

            expect(ctx.beginPath).not.toHaveBeenCalled();
            expect(ctx.moveTo).not.toHaveBeenCalled();
            expect(tool.isDrawing).toBe(false);
            expect(ctx.strokeStyle).toBe('');
        });

    });

    describe('onPointerMove', () => {
        it('Do Nothing (isDrawing: False)', () => {
            tool.isDrawing = false;
            tool.onPointerMove(position, engine);

            expect(ctx.lineTo).not.toHaveBeenCalled();
            expect(ctx.stroke).not.toHaveBeenCalled();
            expect(ctx.closePath).not.toHaveBeenCalled();
            expect(engine.manager.saveState).not.toHaveBeenCalled();
        });

        it('Draw a Line on Movement', () => {
            tool.isDrawing = true;
            tool.onPointerMove(position, engine);

            expect(ctx.lineTo).toHaveBeenCalledOnce();
            expect(ctx.lineTo).toHaveBeenCalledWith(position.x, position.y);
            expect(ctx.stroke).toHaveBeenCalledOnce();
            expect(ctx.closePath).not.toHaveBeenCalled();
            expect(engine.manager.saveState).not.toHaveBeenCalled();
            
        });
    });

    describe('onPointerUp', () => {

        it('Do Nothing (isDrawing: False)', () => {
            tool.onPointerUp(position, engine);

            expect(ctx.lineTo).not.toHaveBeenCalled();
            expect(ctx.closePath).not.toHaveBeenCalled();
            expect(engine.manager.saveState).not.toHaveBeenCalled();
        });

        it('Finish Stroke & Reset Drawing State', () => {
            tool.isDrawing = true;
            tool.onPointerUp(position, engine);

            expect(ctx.lineTo).toHaveBeenCalledOnce();
            expect(ctx.lineTo).toHaveBeenCalledWith(position.x, position.y);
            expect(ctx.stroke).toHaveBeenCalledOnce();
            expect(ctx.closePath).toHaveBeenCalledOnce();
            expect(tool.isDrawing).toBe(false);
        });

        it('Saves State when Drawing Finishes', () => {
            tool.isDrawing = true;
            tool.onPointerUp(position, engine);

            expect(engine.manager.saveState).toHaveBeenCalledOnce();
        });

        it('Safe Operation w/o CanvasManager', () => {
            tool.isDrawing = true;
            engine.manager = null;

            expect(() =>
                tool.onPointerUp(position, engine)
            ).not.toThrow();
        });
        
        it('Do Noting if Drawing has Ended', () => {
            tool.onPointerDown(position, engine, eventLMB);
            tool.onPointerUp(position, engine);

            ctx.lineTo.mockClear();
            ctx.stroke.mockClear();
            ctx.closePath.mockClear();
            engine.manager.saveState.mockClear();

            tool.onPointerUp(position, engine);

            expect(ctx.lineTo).not.toHaveBeenCalled();
            expect(ctx.stroke).not.toHaveBeenCalled();
            expect(ctx.closePath).not.toHaveBeenCalled();
            expect(engine.manager.saveState).not.toHaveBeenCalled();
        });
    });
    describe('Lifecycle Tests', () => {

        it('Draw Path and Save State once Complete', () => {
            const startPosition = {x: 10, y: 20};
            const mid1Position = {x: 30, y: 40};
            const mid2Position = {x: 50, y: 60};
            const endPosition = {x: 70, y: 80};

            tool.onPointerDown(startPosition, engine, eventLMB);
            tool.onPointerMove(mid1Position, engine);
            tool.onPointerMove(mid2Position, engine);
            tool.onPointerUp(endPosition, engine);
   
            expect(ctx.beginPath).toHaveBeenCalledOnce();
            expect(ctx.moveTo).toHaveBeenCalledWith(startPosition.x, startPosition.y);
            expect(ctx.lineTo).toHaveBeenNthCalledWith(1, mid1Position.x, mid1Position.y);
            expect(ctx.lineTo).toHaveBeenNthCalledWith(2, mid2Position.x, mid2Position.y);
            expect(ctx.lineTo).toHaveBeenNthCalledWith(3, endPosition.x, endPosition.y);
            expect(ctx.stroke).toHaveBeenCalledTimes(3);
            expect(ctx.closePath).toHaveBeenCalledOnce();
            expect(engine.manager.saveState).toHaveBeenCalledOnce();
            expect(tool.isDrawing).toBe(false);
        });

    });
});