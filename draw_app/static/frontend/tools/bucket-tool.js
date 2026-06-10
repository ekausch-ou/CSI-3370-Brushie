export class BucketTool extends BaseTool {
    constructor() {
        super('bucket');
    }

    onPointerDown(position, engine) {
        const ctx = engine.drawCtx;
        const canvas = ctx.canvas;

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const targetColor = this.getPixel(imgData, position.x, position.y);
        const fillColor = this.hexToRGBA(engine.primaryColor);

        if (this.colorsMatch(targetColor, fillColor)) return;

        this.floodFill(imgData, position.x, position.y, targetColor, fillColor);
        ctx.putImageData(imgData, 0, 0);

        engine.manager?.saveState();
    }

    getPixel(img, x, y) {
        const i = (y * img.width + x) * 4;
        return img.data.slice(i, i + 4);
    }

    setPixel(img, x, y, color) {
        const i = (y * img.width + x) * 4;
        img.data[i] = color[0];
        img.data[i+1] = color[1];
        img.data[i+2] = color[2];
        img.data[i+3] = color[3];
    }

    colorsMatch(a, b) {
        return a[0] === b[0] &&
               a[1] === b[1] &&
               a[2] === b[2] &&
               a[3] === b[3];
    }

    hexToRGBA(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return [
            (bigint >> 16) & 255,
            (bigint >> 8) & 255,
            bigint & 255,
            255
        ];
    }

    floodFill(img, x, y, target, fill) {
        const stack = [[x, y]];
        const w = img.width;
        const h = img.height;

        while (stack.length) {
            const [cx, cy] = stack.pop();
            const current = this.getPixel(img, cx, cy);

            if (!this.colorsMatch(current, target)) continue;

            this.setPixel(img, cx, cy, fill);

            if (cx > 0) stack.push([cx - 1, cy]);
            if (cx < w - 1) stack.push([cx + 1, cy]);
            if (cy > 0) stack.push([cx, cy - 1]);
            if (cy < h - 1) stack.push([cx, cy + 1]);
        }
    }
}
