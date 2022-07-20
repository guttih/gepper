import { Position, Range, Selection, TextDocument, TextLine } from "vscode";

export interface Pos {
    start: number;
    end: number;
}

export class ClassInformation {
    name: string | null = null;
    body: string | null = null;
    cppBody: string | null = null;

    constructor(document: TextDocument | undefined, selection: Selection | undefined) {
        this.extractNameAndBody(document, selection);
    }

    /**
     * Removes variable names from function declaration
     * @param func Valid function deceleration
     * @returns on success, the deceleration without any variable names, on error returns func unchanged.
     */
    removeFunctionVariableNames(func: string): string {
        let startBracket = func.indexOf("(");
        let endBracket = func.indexOf(")", startBracket + 1);
        if (startBracket < 0 || endBracket < 0 || startBracket >= endBracket) {
            return func;
        }
        func = func.replace(/\s,|,\s/g, ",");
        func = func.replace(/\s=|=\s/g, "=");

        let i,
            iEnd = func.indexOf(",", startBracket + 1);
        let iStart = startBracket;
        let worker, tmp, appendChar;
        if (iEnd < 0) {
            iEnd = endBracket;
        }
        let ret = func.substring(0, ++iStart);
        worker = func.substring(iStart);
        while (iEnd > -1) {
            iEnd = worker.indexOf(",");
            if (iEnd !== -1) {
                appendChar = ",";
            } else {
                appendChar = ")";
                iEnd = worker.indexOf(")");
            }
            if (iEnd < 0) {
                return func; //error
            }
            tmp = worker.substring(0, iEnd);
            i = tmp.lastIndexOf(" ");
            if (i > -1 && ["*", "&"].includes(tmp[i + 1])) {
                i += 2;
            }
            ret += worker.substring(0, i) + appendChar;

            worker = worker.substring(iEnd + 1);
            if (appendChar === ")") {
                ret += worker;
                return ret;
            }
        }
        return func; //error but returning original
    }

    /**
     * Finds missing function decelerations.
     * @param headFuncs Array of header decelerations
     * @param implFuncs Array of header decelerations
     * @param functionPrefix String containing prefix to be inserted in front of each function name
     * @returns All deceleration not existing in implFuncs.  If no functions are missing, null is returned
     */
    getMissingFunctions(headFuncs: string[] | null, implFuncs: string[], functionPrefix: string | null = null): string[] | null {
        if (!headFuncs || headFuncs.length < 1 || !implFuncs) {
            return null;
        }
        //removing all variable names
        let headNoVars = headFuncs.map((e) => this.removeFunctionVariableNames(e));
        let implNoVars = implFuncs.map((e) => this.removeFunctionVariableNames(e));

        //find which are not implemented
        let notImplemented = headNoVars.filter((e) => !implNoVars.includes(e));

        //Restoring variable names for all functions which are not implemented
        let toBeImplemented = headFuncs?.filter((e) => notImplemented.includes(this.removeFunctionVariableNames(e)));
        if (functionPrefix && functionPrefix.length > 0) {
            toBeImplemented = toBeImplemented.map((e) => {
                let name = e.substring(0, e.indexOf("("));
                let iSpace = name.lastIndexOf(" ");
                name = name.substring(iSpace + 1);
                e = e.replace(name, `${functionPrefix}${name}`);
                return e;
            });
        }
        return toBeImplemented && toBeImplemented.length > 0 ? toBeImplemented : null;
    }

    setImplementation(doc: TextDocument) {
        this.cppBody = ClassInformation.linesToString(this.name, doc);
    }
    extractFunctions(body: string | null): string[] {
        if (!body || body.length < 1 || !body.includes(`${this.name}::`)) {
            return [];
        }

        //let's remove all body parts.
        let text = body;
        let tmp, i;
        let pos: Pos | null = text.indexOf("{") > -1 ? { start: 0, end: 0 } : null;
        while (pos) {
            pos = this.getBracketIndex(text);
            if (pos) {
                tmp = text.substring(0, pos.start);
                text = tmp + text.substring(pos.end);
            }
        }
        text = ClassInformation.removeWhiteSpacesFromText(text, false, false);
        let elements = text.split("\n");
        let functions = elements?.filter((e) => e.indexOf(")") > 0 && e.includes(`${this.name}::`));
        functions = functions.map((e) => e.replace(`${this.name}::`, "").trim());

        return functions;
    }

    getImplementedFunctions(): string[] {
        return this.extractFunctions(this.cppBody);
    }

    static removeWhiteSpacesFromText(text: string, removeComments: boolean, removeEndLines: boolean): string {
        //remove comments
        if (removeComments) {
            text = text.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
        }

        //removing white spaces and endlines
        if (removeEndLines) {
            text = text.replace(/\s\s+/g, " ");
        } else {
            //remove all extra tabs and spaces, and double endline
            // text=text.replace(/(\r\n|\n\n|\r)/gm, "\n");
            // text=text.replace(  /  +/g, " " );
            // text=text.replace(  /\t+/g, " " );
            // text=text.replace( /[  |\t]+/g, " " );

            text = text.replace(/\n\s*\n/g, "\n");
            // text = text.replace(/\t+/g, " ");
            text = text.replace(/[  |\t]+/g, " ");
        }

        // text = text.replace(/\r?\n|\r/g, " ");
        //replacing " :" and ": " with ":"
        text = text.replace(/\s:|:\s/g, ":");
        text = text.replace(/\(\s/g, "(");
        text = text.replace(/\s\)/g, ")");
        return text;
    }
    // static removeCommentsAndEndLines(text: string): string {
    //     let ret = text.replace(/\s/g, " ").trim();

    //     //remove comments
    //     ret = ret.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");

    //     //removing white spaces and end lines
    //     ret = ret.replace(/\s\s+/g, " ");
    //     return ret;
    // }

    static linesToString(className: string | null, doc: TextDocument): string | null {
        if (!className || className.length < 1 || !doc) {
            return null;
        }
        return this.removeWhiteSpacesFromText(doc.getText(), true, false).trim();
    }
    static extractFunctionNames(className: string, text: string): string[] {
        //find this.cppBody.includes(`${this.name}::`
        //while found `${this.name}::`
        //find '(
        //remove found
        let ret: string[] = [];
        let prefixLen = `${className}::`.length;
        let iFnName = text.indexOf(`${className}::`),
            iBracketClose,
            iBracketOpen = text.indexOf("(", iFnName);
        while (iFnName > -1 && iBracketOpen > iFnName) {
            iBracketClose = text.indexOf(")", iBracketOpen + 1);
            if (iBracketClose < iFnName) {
                break; //should not happen, but we could have syntax error
            }

            ret.push(text.substring(prefixLen + iFnName, iBracketOpen));
            text = text.substring(iBracketClose);
            (iFnName = text.indexOf(`${className}::`)), (iBracketOpen = text.indexOf("(", iFnName));
        }
        return ret;
    }

    extractNameAndBody(document: TextDocument | undefined, selection: Selection | undefined) {
        if (!document || !selection) {
            return;
        }

        //Get the class name
        let selectedLineIndex = selection.active.line < selection.anchor.line ? selection.active.line : selection.anchor.line;
        let selectedLine = document.lineAt(selectedLineIndex);
        let current: string = selectedLine.text.replace(/\s\s+/g, " ").trim();
        let i = current.indexOf("class ");
        if (i < 0) {
            return;
        }
        let iStart = i + 6;
        i = current.indexOf(" ", iStart);
        if (i > -1) {
            this.name = current.substring(iStart, i);
        } else {
            this.name = current.substring(iStart);
        }

        //get the header class body
        var lastLine = document.lineAt(document.lineCount - 1);

        let lineSelectedAndBelowRange = new Range(selectedLine.range.start, lastLine.range.end);
        let selectedAndBelowText = document.getText(lineSelectedAndBelowRange);

        //remove comments
        selectedAndBelowText = selectedAndBelowText.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
        if (selectedAndBelowText.indexOf("#define") > -1) {
            return; //Not supporting define inside a class header
        }

        //removing white spaces and end lines
        selectedAndBelowText = selectedAndBelowText.replace(/\s\s+/g, " ");
        selectedAndBelowText = selectedAndBelowText.replace(/\r?\n|\r/g, " ");
        //replacing " :" and ": " with ":"
        selectedAndBelowText = selectedAndBelowText.replace(/\s:|:\s/g, ":");

        const iOpen = selectedAndBelowText.indexOf("{");
        if (iOpen < 1) {
            return;
        }
        let pos = this.getBracketIndex(selectedAndBelowText);
        if (pos) {
            this.body = selectedAndBelowText.substring(pos.start + 1, pos.end - 1).trim();
        }
    }

    static selectFirstClassDeceleration(document: TextDocument | undefined): Selection | undefined {
        if (!document) {
            return undefined;
        }
        let line: TextLine;
        let name, text;
        for (let i = 0; i < document.lineCount; i++) {
            line = document.lineAt(i);
            text = ClassInformation.removeWhiteSpacesFromText(line.text, true, false).trimStart();

            let index = text.indexOf("class ");
            if (index > -1) {
                //we found a class lets return this selection
                name = text.substring(index + 6);
                index = name.indexOf(" ");
                if (index > -1) {
                    name = name.substring(0, index);
                }
                //let's create a selection an return it
                let selRet = new Selection(new Position(i, 0), new Position(i, 0));
                return selRet;
            }
        }
        return undefined;
    }
    getFunctions(removeImplementedInHeader: boolean = false) {
        if (!this.body) {
            return null;
        }

        let text = this.body.replace(/private:|public:|protected:|/g, "");
        let i = 0;

        let pos: Pos | null = text.indexOf("{") > -1 ? { start: 0, end: 0 } : null;
        let tmp;
        while (pos) {
            pos = this.getBracketIndex(text);

            if (pos) {
                if (removeImplementedInHeader) {
                    i = text.lastIndexOf(";", pos.start);
                    if (i > -1) {
                        pos.start = i;
                    } else {
                        pos.start = 0;
                    }
                }
                tmp = text.substring(0, pos.start);
                text = tmp + ";" + text.substring(pos.end);
            }
        }
        text = ClassInformation.removeWhiteSpacesFromText(text, false, false);
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
