export class FileManager {
    writeFile(data, options = {}) {
        const blob = new Blob([data], {
            type: options.type || "application/json"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = options.filename + ".brush" || "drawing.brush";
        link.click();
        URL.revokeObjectURL(url);
    }

    async readFile(file) {
        return await file.text();
    }

    writeExportFile(dataUrl, options = {}) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = options.filename || "export.png";
        link.click();
        return link;
    }
}