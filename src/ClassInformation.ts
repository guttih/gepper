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
     * @param func Valid function declaration
     * @returns on success, the declaration without any variable names, on error returns func unchanged.
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
     * Finds missing function declarations.
     * @param headFuncs Array of header declarations
     * @param implFuncs Array of header declarations
     * @param functionPrefix String containing prefix to be inserted in front of each function name
     * @returns All declaration not existing in implFuncs.  If no functions are missing, null is returned
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
        if (!this.name || this.name.length < 1 || !doc) {
            this.cppBody = null;
        }
        this.cppBody =ClassInformation.removeWhiteSpacesFromText(doc.getText(), true, false).trim();
    }

    getHeaderFunctions(removeImplementedInHeader: boolean = false) {
        if (!this.body) {
            return null;
        }

        let text = this.body.replace(/private:|public:|protected:|/g, "");
        let i = 0;

        let pos: Pos | null = text.indexOf("{") > -1 ? { start: 0, end: 0 } : null;
        let tmp;
        while (pos) {
            pos = this.getOpenAndCloseTokenPos(text);

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
    getImplementedFunctionsWorker(body: string | null): string[] {
        if (!body || body.length < 1 || !body.includes(`${this.name}::`)) {
            return [];
        }

        //let's remove all body parts.
        let text = body;
        let tmp, i;
        let pos: Pos | null = text.indexOf("{") > -1 ? { start: 0, end: 0 } : null;
        while (pos) {
            pos = this.getOpenAndCloseTokenPos(text);
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
        return this.getImplementedFunctionsWorker(this.cppBody);
    }

    static removeWhiteSpacesFromText(text: string, removeComments: boolean, removeEndLines: boolean): string {
        //remove comments
        if (removeComments) {
            text = text.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
        }

        if (removeEndLines) {
            //removing white spaces and end-lines
            text = text.replace(/\s\s+/g, " ");
        } else {
            //removing white spaces and double-end-lines
            text = text.replace(/\n\s*\n/g, "\n");
            text = text.replace(/[  |\t]+/g, " ");
        }
        //remove spaces around ':' and spaces inside '(' and ')'
        text = text.replace(/\s:|:\s/g, ":");
        text = text.replace(/\(\s/g, "(");
        text = text.replace(/\s\)/g, ")");
        return text;
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
        let pos = this.getOpenAndCloseTokenPos(selectedAndBelowText);
        if (pos) {
            this.body = selectedAndBelowText.substring(pos.start + 1, pos.end - 1).trim();
        }
    }

    /**
     * Searches for the first class declaration in a document and returns a selection where 
     * start and end position of that class is selected.
     * @param document Document to search
     * @returns Start and end position of the first class declaration
     */
    static selectFirstClassDeclaration(document: TextDocument | undefined): Selection | undefined {
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
    isValid() {
        return this.name !== null && this.body !== null;
    }

    /**
     * Searches for position of start and end tokens, where these tokens can be nested.
     * Usually used for scanning for opening and closing of a bracket or a curly bracket.
     * @param text text to scan
     * @param tokenOpen starting token
     * @param tokenClose ending token
     * @param iStart specify the exact position of the first starting token
     * @returns start position of the first starting token and end position of the last starting token
     */
    getOpenAndCloseTokenPos(text: string, tokenOpen:string="{", tokenClose:string="}", iStart: number = -1): Pos | null {
        
        const iOpen = text.indexOf(tokenOpen);
        if (iOpen < 1) {
            return null;
        }
        if (iStart > -1 && text.indexOf(tokenOpen,iStart) !== iStart) {
            return null; //incorrect index of iStart iStart should point to first bracketOpen
        } else {
            iStart = text.indexOf(tokenOpen);
        }
        let iTotalStart = iStart;
        let indent = 1,
            i = 0,
            endOf = -1,
            iEnd = text.indexOf(tokenClose);
        let tmp;
        while (indent > 0) {
            tmp = text.substring(i);
            iStart = tmp.indexOf(tokenOpen);
            iEnd = tmp.indexOf(tokenClose);
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
