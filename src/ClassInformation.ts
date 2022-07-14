import { Range, Selection, TextDocument, TextLine } from "vscode";

export class ClassInformation {
    name: string | null = null;
    body: string | null = null;
    lines: TextLine[] | null = null;
    
    constructor(document: TextDocument | undefined, selection: Selection | undefined) {
        
        this.extractNameAndBody(document, selection);
        
        if (this.isValid()) {
            console.log(`Name: ${this.name}`);
            console.log(`Body: ${this.body}`);
        }
    }

    extractNameAndBody(document: TextDocument | undefined, selection: Selection | undefined) {
        if (!document || !selection) {
            return;
        }
        let selectedLineIndex = selection.active.line < selection.anchor.line ? selection.active.line : selection.anchor.line;
        let selectedLine = document.lineAt(selectedLineIndex);
        let current: string = selectedLine.text.replace(/\s/g, " ").trim();
        // let matchName = current.match(/\(?<=\bclass\s)(\w+)/);
        let i = current.indexOf("class ");
        if (i < 0) {
            return;
        }
        let iStart = i + 6;
        current = current.substring(iStart);
        i = current.indexOf(" ");
        if (i > -1) {
            this.name = current.substring(0, i);
        } else {
            this.name = current;
        }

        var lastLine = document.lineAt(document.lineCount - 1);

        let lineSelectedAndBelowRange = new Range(selectedLine.range.start, lastLine.range.end);
        let selectedAndBelowText = document.getText(lineSelectedAndBelowRange);

        //remove comments
        selectedAndBelowText = selectedAndBelowText.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
        if (selectedAndBelowText.indexOf("#define") > -1) {
            return; //Not supporting define inside a class header
        }

        selectedAndBelowText = selectedAndBelowText.replace(/\s\s+/g, " ");
        selectedAndBelowText = selectedAndBelowText.replace(/\r?\n|\r/g, " ");

        selectedAndBelowText = selectedAndBelowText.replace(/\s:|:\s/g, ":");

        const iOpen = selectedAndBelowText.indexOf("{");
        if (iOpen < 1) {
            return;
        }
        // let iClose = this.getClosingBracketIndex(selectedAndBelowText, iOpen);
        let iTotalStart = (iStart = selectedAndBelowText.indexOf("{"));
        let iEnd = selectedAndBelowText.indexOf("}");
        let tmp;
        let goOn = iStart > -1 && iStart < iEnd;
        let indent = 1;
        i = 0;
        let endOf = -1;
        while (indent > 0) {
            tmp = selectedAndBelowText.substring(i);
            iStart = tmp.indexOf("{");
            iEnd = tmp.indexOf("}");
            if (iStart > -1 && iStart < iEnd) {
                indent++;
                i += iStart + 1;
            } else if ((iEnd > -1 && iEnd < iStart) || iEnd > -1) {
                indent--;
                i += iEnd + 1;
                if (indent === 1) {
                    endOf = i;
                    break;
                }
            } else {
                i = -1;
                break;
            }
        }
        if (endOf < 1) {
            return;
        }

        this.body = selectedAndBelowText.substring(iTotalStart + 1, endOf - 1).trim();
    }
    getFunctions(){
        let text=this.body?.replace(/private:|public:|protected:|/g, "");
        let elements = text?.split(";");
        elements=elements?.map(e=>e.trim());
        let functions = elements?.filter(e => e.indexOf(')')>0);
        return functions;
    }

    isValid() {
        return this.name !== null && this.body !== null;
    }
}
