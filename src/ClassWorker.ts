import { window, TextDocument, Selection, workspace, ViewColumn, Position, QuickPickItem, TextLine } from "vscode";
import { ClassAccess } from "./ClassTypes";
import { ClassInformation } from "./ClassInformation";
import * as path from "path";
import { DiskFunctions } from "./DiskFunctions";
import { TokenWorker } from "./TokenWorker";
import { ClassCreator, OpenAfterClassCreation } from "./ClassCreator";

export interface ClassDeclarationFunctions {
    inHeader: string[];
    notImplementedInHeader: string[];
    inSource: string[];
    notImplemented: string[];
}

interface FunctionInformation {
    declaration: string;
    implementation: string;
}
interface PickItem {
    label: string;
    description: string;
    picked: boolean;
    detail: string;
    data: FunctionInformation;
}

export class ClassWorker {
    /**
     *
     * @param funcs functions create implementations for
     * @returns empty string if noting to implement otherwise string containing implementation code
     */
    static createImplementationsFromDeclarations(funcs: string[] | FunctionInformation[] | null): string {
        if (!funcs || funcs.length < 0) {
            return "";
        }

        const isArrayOfInformation = (object: unknown): object is FunctionInformation => {
            return object instanceof Object && "declaration" in object && "implementation" in object;
        };

        const addFunctionNotImplemented = (funcDecl: string, funcImpl: string = ""): string => {
            let name = funcDecl.substring(0, funcDecl.indexOf("("));
            let i = name.lastIndexOf(" ");
            if (i > -1) {
                name = name.substring(i + 1);
            }
            const implementation: string = funcImpl.length > 0 ? funcImpl : `{\n    throw "${name} is not implemented yet.";\n}`;
            return `\n${funcDecl}\n${implementation}`;
        };

        let ret = "";
        for (let i = 0; i < funcs.length; i++) {
            const item: string | FunctionInformation = funcs[i];
            if (isArrayOfInformation(item)) {
                ret += addFunctionNotImplemented(item.declaration, item.implementation);
            } else if (typeof item === "string") {
                ret += addFunctionNotImplemented(item);
            }
        }
        return ret;
    }
    static msg(msg: string) {
        window.showInformationMessage("ClassWorker:" + msg);
    }

    /**
     * Add or get class functions which are declared in header document but not in implementation document
     * @param openImplementationFileIfClosed If no open documentation with class implementation, should the disk be searched for one
     * @param addToImplementationDocument Add all functions not implemented to the implementation document
     * @returns Array of functions not implemented before this function was executed
     */
    static async implementMissingClassFunctions(
        openImplementationFileIfClosed: boolean,
        addToImplementationDocument: boolean
    ): Promise<ClassDeclarationFunctions | null> {
        // //Make ClassInformation
        let info: ClassInformation = ClassWorker.getClassInformationFromActiveDocument();
        if (!info.isValid()) {
            window.showWarningMessage(`Could not parse class in file`);
            return null;
        }
        let missing = info.getHeaderFunctions(true);
        if (missing.length < 1) {
            return null; //nothing to do
        }

        const implementationDocOrPath = ClassWorker.findImplementationFile(info.name, window.activeTextEditor?.document.fileName);
        if (implementationDocOrPath === null) {
            window.showWarningMessage("Could not find a file to put the implementations to");
            return null;
        }
        let doc: TextDocument;
        if (typeof implementationDocOrPath === "string") {
            if (!openImplementationFileIfClosed) {
                return null;
            }
            //We did not get an open document, but we got the location of one, so we will need to open it
            doc = await workspace.openTextDocument(implementationDocOrPath);
        } else {
            doc = implementationDocOrPath;
        }
        info.setImplementation(doc);
        let headFuncs = info.getHeaderFunctions(true);
        let implFuncs = info.getImplementedFunctions();
        let missingFuncs = info.getMissingFunctions(headFuncs, implFuncs, `${info.name}::`);

        let ret: ClassDeclarationFunctions = {
            inHeader: info.getHeaderFunctions(false),
            notImplementedInHeader: headFuncs,
            notImplemented: missingFuncs,
            inSource: implFuncs,
        };
        if (!addToImplementationDocument) {
            return ret;
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

        return ret;
    }

    static getClassInformationFromActiveDocument(): ClassInformation {
        const headerFile = window.activeTextEditor?.document;
        let info: ClassInformation;
        let selection = window.activeTextEditor?.selection;
        if (this.isInsideClassLine(headerFile, selection)) {
            info = new ClassInformation(headerFile, selection);
        } else {
            info = new ClassInformation(headerFile, ClassInformation.selectFirstClassDeclaration(window.activeTextEditor?.document));
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
    static selectFirstClassDeclaration(document: TextDocument | undefined): Selection | undefined {
        return ClassInformation.selectFirstClassDeclaration(document);
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

    /**
     * Searches if at least one class implementation exist in a file on disk
     * @param className Name of class to check for
     * @param testFile path to a file on disk to search
     * @returns true if one or more class implementation for given class name exists in the file, otherwise false
     */
    static doesFileImplementClass(className: string, testFile: string): boolean {
        if (DiskFunctions.fileExists(testFile)) {
            const content = DiskFunctions.readFromFile(testFile);
            if (content && content.includes(`${className}::`)) {
                return true;
            }
        }
        return false;
    }

    static createNewClass(className: string | undefined, dir?: string): ClassCreator | null {
        if (TokenWorker.isOnlySpaces(className)) {
            return null;
        }
        const maker = new ClassCreator(String(className), dir);
        if (!maker.saveClassFiles()) {
            window.showErrorMessage(`Unable to create Class "${className} in directory ${maker.getDir()}"!`);
            return null;
        }

        switch (maker.getRawClassCreatedShowFile()) {
            case OpenAfterClassCreation.headerFile:
                workspace.openTextDocument(maker.getHeaderFileName(true)).then((doc) => {
                    window.showTextDocument(doc, {
                        viewColumn: ViewColumn.Active,
                    });
                });
                break;
            case OpenAfterClassCreation.sourceFile:
                workspace.openTextDocument(maker.getImplementationFileName(true)).then((doc) => {
                    window.showTextDocument(doc, {
                        viewColumn: ViewColumn.Active,
                    });
                });
                break;
        }

        return maker;
    }

    static addClassOperatorsAskUser(options: PickItem[]) {
        //return new Promise<number>(async (resolve, reject) => {
        return new Promise<PickItem[] | undefined>(async (resolve, rejects) => {
            window
                .showQuickPick(options, {
                    title: "Add operators to a C++ Class",
                    placeHolder: "Please select which operators to you want to add!",
                    canPickMany: true,
                })
                .then((data) => {
                    if (data) {
                        // window.showInformationMessage(msg, { modal: true });
                        resolve(data);
                    }
                    rejects(undefined);
                });
        });
    }
    static async addClassOperators(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, rejects) => {
            let info: ClassInformation = ClassWorker.getClassInformationFromActiveDocument();
            if (!info.isValid()) {
                window.showWarningMessage(`Could not parse class in file`);
                return rejects(false);
            }
            const className = info.name;
            const operators = [
                {
                    label: "Class Assignment operator",
                    description: " objectA = objectB",
                    picked: true,
                    detail: "Operator to copy all values from object B into object A",
                    data: {
                        declaration: `${className} &operator=(const ${className} &rhs)`,
                        implementation: "",
                    },
                },
                {
                    label: "Class Equality operator",
                    description: " objectA == objectB",
                    picked: true,
                    detail: "Operator to check if object A is equal to object B",
                    data: {
                        declaration: `bool operator==(const ${className} &rhs)`,
                        implementation: "",
                    },
                },
                {
                    label: "Class Not equal operator",
                    description: " objectA != objectB",
                    picked: true,
                    detail: "Operator to check if object A is different than object B",
                    data: {
                        declaration: `bool operator!=(const ${className} &rhs)`,
                        implementation: "{\n    return !( *this == rhs );\n}",
                    },
                },
                {
                    label: "Class Greater than operator",
                    description: " objectA > objectB",
                    picked: false,
                    detail: "Operator to check if object A is greater than object B",
                    data: {
                        declaration: `bool operator>(const ${className} &rhs)`,
                        implementation: "",
                    },
                },
                {
                    label: "Class Less than operator",
                    description: " objectA < objectB",
                    picked: false,
                    detail: "Operator to check if object A is less than object B",
                    data: {
                        declaration: `bool operator<(const ${className} &rhs)`,
                        implementation: "",
                    },
                },
                {
                    label: "Class Greater than or Equal operator",
                    description: " objectA >= objectB",
                    picked: false,
                    detail: "Operator to check if object A is greater than or equal to object B",
                    data: {
                        declaration: `bool operator>=(const ${className} &rhs)`,
                        implementation: "{\n    return *this > rhs || *this == rhs;\n}",
                    },
                },
                {
                    label: "Class Less than or Equal operator",
                    description: " objectA <= objectB",
                    picked: false,
                    detail: "Operator to check if object A is less than or equal to object B",
                    data: {
                        declaration: `bool operator<=(const ${className} &rhs)`,
                        implementation: "{\n    return *this < rhs || *this == rhs;\n}",
                    },
                },
            ];

            let classFunctions = await ClassWorker.implementMissingClassFunctions(true, false);
            if (!classFunctions) {
                return rejects(false);
            }

            const implementationDocOrPath = ClassWorker.findImplementationFile(info.name, window.activeTextEditor?.document.fileName);
            if (implementationDocOrPath === null) {
                window.showWarningMessage("Could not find a file to put the implementations to");
                return null;
            }
            let doc: TextDocument;
            if (typeof implementationDocOrPath === "string") {
                //We did not get an open document, but we got the location of one, so we will need to open it
                doc = await workspace.openTextDocument(implementationDocOrPath);
            } else {
                doc = implementationDocOrPath;
            }
            info.setImplementation(doc);

            let headNoVars = classFunctions.inHeader.map((e) => ClassInformation.removeFunctionVariableNames(e, true));
            let operatorsNotImplemented: PickItem[] = operators.filter(
                (e) => headNoVars.indexOf(ClassInformation.removeFunctionVariableNames(e.data.declaration, true)) === -1
            );

            if (operatorsNotImplemented.length > 0) {
                let picked = await ClassWorker.addClassOperatorsAskUser(operatorsNotImplemented);
                if (picked && picked?.length > 0) {
                    let functionsToAdd = picked.map((e) => e.data);
                    let code = ClassWorker.createImplementationsFromDeclarations(
                        functionsToAdd.map((e) => {
                            return {
                                declaration: ClassInformation.addPrefixToFunctionName(e.declaration, `${info.name}::`, true),
                                implementation: e.implementation,
                            };
                        })
                    );
                    let success: boolean = await ClassWorker.addFunctionsToActiveHeaderDocument(
                        ClassAccess.public,
                        functionsToAdd.map((e) => e.declaration)
                    );
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
                                    return rejects(success);
                                }
                                let last = doc.lineAt(doc.lineCount - 1);
                                editor.selection = new Selection(new Position(docLengthBefore, 0), last.range.end);
                                editor.revealRange(editor.selection);
                                return resolve(success);
                            });
                    }
                } else {
                    return rejects(false);
                }
            } else {
                window.showInformationMessage("All available operators already implemented.");
                return resolve(true); //success if everything is already implemented
            }
        });
    }
    static addFunctionsToActiveHeaderDocument(access: ClassAccess, functionsToAdd: string[]): Promise<boolean> {
        let str = "";
        functionsToAdd.forEach((e) => (str += `\n    ${e};`));

        return new Promise<boolean>(async (resolve, rejects) => {
            const editor = window.activeTextEditor;
            let line: TextLine | null = null;
            if (str.length > 0 && editor && editor.document) {
                editor
                    .edit((editBuilder) => {
                        //search for access string
                        const doc = editor.document;
                        let i;

                        for (i = 0; i < doc.lineCount; i++) {
                            line = doc.lineAt(i);
                            const testLine = ClassInformation.removeWhiteSpacesFromText(line.text, true, true);
                            if (testLine === access || testLine === access + " ") {
                                break;
                            }
                        }
                        if (i >= doc.lineCount - 1 || !line) {
                            return rejects(false);
                        }
                        //We found the line
                        editBuilder.insert(line.range.end, str);
                    })
                    .then((success) => {
                        if (!success) {
                            return rejects(success);
                        }
                        if (line) {
                            const lastLineInserted = editor.document.lineAt(line.lineNumber + functionsToAdd.length);
                            editor.selection = new Selection(new Position(line.lineNumber + 1, 0), lastLineInserted.range.end);
                            editor.revealRange(editor.selection);
                        }
                        return resolve(success);
                    });
            } else {
                return rejects(false);
            }
        });
    }
}
