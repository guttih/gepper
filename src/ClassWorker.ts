import { window, TextDocument, Selection, workspace, ViewColumn, Position } from "vscode";
import { ClassInformation } from "./ClassInformation";
import * as path from "path";
import { DiskFunctions } from "./DiskFunctions";

export class ClassWorker {
    /**
     *
     * @param funcs functions create implementations for
     * @returns empty string if noting to implement otherwise string containing implementation code
     */
    static createImplementationsFromDeclarations(funcs: string[] | null): string {
        if (!funcs) {
            return "";
        }

        const addFunctionNotImplemented = (funcDecl: string): string => {
            let name = funcDecl.substring(0, funcDecl.indexOf("("));
            let i = name.lastIndexOf(" ");
            if (i > -1) {
                name = name.substring(i + 1);
            }

            return `{\n    throw "${name} is not implemented yet.";\n}`;
        };

        let ret = "";
        for (let i = 0; i < funcs.length; i++) {
            // current = funcs[i].replace(/;$/, '');
            ret += `\n${funcs[i]}\n${addFunctionNotImplemented(funcs[i])}`;
        }
        return ret;
    }
    static msg(msg: string) {
        window.showInformationMessage("ClassWorker:" + msg);
    }

    static async implementMissingClassFunctions(
        openImplementationFileIfClosed: boolean,
        addToImplementationDocument: boolean
    ): Promise<string[] | null> {
        // //Make ClassInformation
        let info: ClassInformation = ClassWorker.getClassInformationFromActiveDocument();
        if (!info.isValid()) {
            window.showWarningMessage(`Could not parse class in file`);
            return null;
        }
        let missing = info.getFunctions(true);
        if (!missing || missing.length < 1) {
            return null; //nothing to do
        }

        const ret = ClassWorker.findImplementationFile(info.name, window.activeTextEditor?.document.fileName);
        if (ret === null) {
            window.showWarningMessage("Could not find a file to put the implementations to");
            return null;
        }
        let doc: TextDocument;
        if (typeof ret === "string") {
            if (!openImplementationFileIfClosed) {
                return null;
            }
            //We did not get an open document, but we got the location of one, so we will need to open it
            doc = await workspace.openTextDocument(ret);
        } else {
            doc = ret;
        }
        info.setImplementation(doc);
        let headFuncs = info.getFunctions(true);
        let implFuncs = info.getImplementedFunctions();
        let missingFuncs = info.getMissingFunctions(headFuncs, implFuncs, `${info.name}::`);
        if (!addToImplementationDocument) {
            return missingFuncs;
        }
        let code = ClassWorker.createImplementationsFromDeclarations(missingFuncs);
        await window.showTextDocument(doc, {
            viewColumn: ViewColumn.Active,
        });
        const editor = window.activeTextEditor;
        const docLengthBefore = doc.lineCount;
        if (code.length > 0 && editor) {
            editor
                .edit((editBuilder) => {
                    editBuilder.insert(new Position(docLengthBefore, 0), code);
                })
                .then((success) => {
                    if (!success) {
                        return;
                    }
                    let last = doc.lineAt(doc.lineCount - 1);
                    editor.selection = new Selection(new Position(docLengthBefore, 0), last.range.end);
                    editor.revealRange(editor.selection);
                });
        }

        return missingFuncs;
    }

    static getClassInformationFromActiveDocument(): ClassInformation {
        const headerFile = window.activeTextEditor?.document;
        let info: ClassInformation;
        let selection = window.activeTextEditor?.selection;
        if (this.isInsideClassLine(headerFile, selection)) {
            info = new ClassInformation(headerFile, selection);
        } else {
            info = new ClassInformation(headerFile, this.selectFirstClassDeceleration(window.activeTextEditor?.document));
        }

        return info;
    }

    static isInsideClassLine(document: TextDocument | undefined, selection: Selection | undefined): boolean {
        if (!document || !selection) {
            return false;
        }
        let selectedLineIndex = selection.active.line < selection.anchor.line ? selection.active.line : selection.anchor.line;
        // editor.selection.isEmpty
        let selectedLine = document.lineAt(selectedLineIndex);
        let current: string = selectedLine.text.replace(/\s/g, " ").trim();
        const i = current.indexOf("class ");
        return i > -1;
    }
    static selectFirstClassDeceleration(document: TextDocument | undefined): Selection | undefined {
        return ClassInformation.selectFirstClassDeceleration(document);
    }
    static findImplementationFile(className: string | null, fileName: string | undefined): TextDocument | string | null {
        if (!className || !fileName) {
            return null;
        }
        const pathObject = path.parse(fileName);
        let extension = pathObject.ext;
        if (!extension.startsWith(".h")) {
            return null;
        }
        let workspaceDocs = workspace.textDocuments;
        let docs = workspaceDocs.filter((e) => e.languageId === "cpp" && e.getText().includes(`${className}::`));
        if (docs.length === 1) {
            return docs[0];
        } else if (docs.length > 1) {
            const findFile = docs[0].fileName;
            if (docs.length === docs.filter((e) => e.fileName === findFile).length) {
                return docs[0]; //all open tabs have the same name on disk, so let's just select the first one, ... //TODO: or should we select the last one?
            }
            //ok we go multiple open documents and one or more filenames do no not match where they have implementation for the same class, this is not good, so quitting
            return null;
        }

        let classImplementationFileNameExtension: string | undefined = workspace
            .getConfiguration()
            .get("cpp.gepper.classImplementationFileNameScheme");
        let ext = classImplementationFileNameExtension ? path.extname(classImplementationFileNameExtension) : ".cpp";
        let testFile = `${path.join(pathObject.dir, pathObject.name)}${ext}`;
        if (!this.doesFileImplementClass(className, testFile)) {
            //test parent dir
            const parentDir = path.dirname(pathObject.dir);
            testFile = `${path.join(parentDir, pathObject.name)}${ext}`;
            if (!this.doesFileImplementClass(className, testFile)) {
                //test parent dir/src
                testFile = `${path.join(path.join(parentDir, "src"), pathObject.name)}${ext}`;
                if (!this.doesFileImplementClass(className, testFile)) {
                    return null;
                }
            }
        }
        return testFile;
    }

    static doesFileImplementClass(className: string, testFile: string): boolean {
        if (DiskFunctions.fileExists(testFile)) {
            const content = DiskFunctions.readFromFile(testFile);
            if (content && content.includes(`${className}::`)) {
                return true;
            }
        }
        return false;
    }
}
