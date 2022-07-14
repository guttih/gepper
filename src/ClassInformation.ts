import { Range, Selection, TextDocument, TextLine } from "vscode";

export interface Pos {
    start: number;
    end: number;
}

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
    getFunctions(removeImplementedInHeader: boolean = false) {
        if (!this.body) {
            return null;
        }

        let text = this.body.replace(/private:|public:|protected:|/g, "");
        let i = 0;
        // todo:remove all function bodies
        let pos: Pos | null = text.indexOf("{") > -1 ? { start: 0, end: 0 } : null;
        let tmp;
        while (pos) {
            pos = this.getBracketIndex(text);

            if (pos) {
                if (removeImplementedInHeader) {
                    i = text.lastIndexOf(";", pos.start);
                    if (i > -1) {
                        pos.start = i + 1;
                    } else {
                        pos.start = 0;
                    }
                    // i = pos.start;
                    // while (i > 0) {
                    //     if (text[i] === ";") {
                    //         break;
                    //     } else {
                    //         i--;
                    //     }
                    // }
                    //we need to jump back until we find beginning of file or ;
                }
                tmp = text.substring(0, pos.start);
                text = tmp + text.substring(pos.end);
            }
        }
        let elements = text?.split(";");
        elements = elements?.map((e) => e.trim());
        let functions = elements?.filter((e) => e.indexOf(")") > 0);
        return functions;
    }

    isValid() {
        return this.name !== null && this.body !== null;
    }

    getBracketIndex(text: string, iStart: number = -1): Pos | null {
        const iOpen = text.indexOf("{");
        if (iOpen < 1) {
            return null;
        }
        if (iStart > -1 && text[iStart] !== "{") {
            return null; //incorrect index of iStart
        } else {
            iStart = text.indexOf("{");
        }
        let iTotalStart = iStart;
        let indent = 1,
            i = 0,
            endOf = -1,
            iEnd = text.indexOf("}");
        let tmp;
        while (indent > 0) {
            tmp = text.substring(i);
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
        return {
            start: iTotalStart,
            end: endOf,
        };
    }
}
