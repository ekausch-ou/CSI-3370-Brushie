export class Drawing {
    constructor({
        id = crypto.randomUUID(),
        width = 1920,
        height = 1080,
        backgroundColor = "#ffffff",
        elements = []
    } = {}) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.backgroundColor = backgroundColor;
        this.elements = elements;
    }
}
