import * as monaco from "monaco-editor";

export class Editor {
    private editor: monaco.editor.IStandaloneCodeEditor;
    private textFile: string | undefined;

    constructor(el: HTMLElement, initFile: string, storageKey: string, safeDelay: number = 5000) {
        this.editor = monaco.editor.create(el, {
            automaticLayout: true,
            language: "text/plain",
            scrollBeyondLastLine: true,
            // tslint:disable-next-line: max-line-length
            value: "The hash part of component paths is highly distinctive, e.g., 5jq6jgkamxjj.... Therefore we can discover retained dependencies generically, independent of specific file formats, by scanning for occurrences of hash parts. For instance, the executable image in Figure 2.4 contains the highlighted string 5jq6jgkamxjj..., which is evidence that an execution of the svn program might need that particular OpenSSL instance.\n\n",
            fontFamily: "Helvetica",
            // {fontSize: 14} worked well, but let us test drive the default
            wordWrap: "wordWrapColumn",
            wordWrapColumn: 70,
            disableMonospaceOptimizations: true,
            codeLens: false,
            cursorBlinking: "solid",
            quickSuggestions: false,
            minimap: {enabled: false},
            occurrencesHighlight: false,
            selectionHighlight: false,
            highlightActiveIndentGuide: false,
        });
        let safeTimeout: number;
        this.editor.onDidChangeModelContent(() => {
            if (safeTimeout) {
                clearTimeout(safeTimeout);
            }
            safeTimeout = window.setTimeout(
                () => window.localStorage.setItem(storageKey, this.editor.getValue()),
                safeDelay);
        });
    }

    download(fileName: string) {
        const data = new Blob([this.editor.getValue()], { type: "text/plain" });
        if (this.textFile) {
            window.URL.revokeObjectURL(this.textFile);
        }
        this.textFile = window.URL.createObjectURL(data);
        const link = document.createElement("a");
        link.download = fileName;
        link.href = this.textFile;
        link.dispatchEvent(new MouseEvent("click"));
    }

    upload() {
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = () => {
            const fileReader = new FileReader();
            fileReader.onload = () => this.editor.setValue(fileReader.result as string);
            fileReader.readAsText(input.files![0]);
        };
        input.click();
    }

    async transpile(scope: any = {}) {
        const names = Object.keys(scope);
        const args = names.map((key) => scope[key]);
        const resource = this.editor.getModel().uri;
        const errors = monaco.editor.getModelMarkers({ resource })
            .map((m) => `Line ${m.startLineNumber}: ${m.message}`)
            .join("\n");
        if (errors.length > 0) {
            throw errors;
        }
        const worker = await monaco.languages.typescript.getTypeScriptWorker();
        const client = await worker(resource);
        const output = await client.getEmitOutput(resource.toString());
        const code = output.outputFiles[0].text as string;
        const src = `"use strict";(function(${names.join()}){eval(${JSON.stringify(code)})}).apply(this, arguments[0])`;
        return () => new Function(src).call(window, args);
    }

}
