import { window, TextDocument, Selection, workspace } from "vscode";
import { ClassInformation } from "./ClassInformation";
import * as path from "path";
import { DiskFunctions } from "./DiskFunctions";
import { ClassCreator } from "./ClassCreator";

export class ClassWorker {
    static addDeclarations(funcs: string[] | null, info: ClassInformation, doc: TextDocument) {
        if (!funcs || !info || !doc) {
            return;
        }
        const addFunctionNotImplemented = (funcDecl: string):string=>{
            let name=funcDecl.substring(0, funcDecl.indexOf('('));
            let i = name.lastIndexOf(" ");
            if (i>-1){
                name=name.substring(i+1);
            }

            return `{\n    throw "${name} is not implemented yet.";\n}\n`;
        };

        let addMe;
        for (let i = 0; i < funcs.length; i++) {
            // current = funcs[i].replace(/;$/, '');
            addMe=funcs[i] + "\n"+addFunctionNotImplemented(funcs[i]);
            console.log(addMe);

        }
    }
    static msg(msg: string) {
        window.showInformationMessage("ClassWorker:" + msg);
    }

    static getClassInformationFromActiveDocument(): ClassInformation {
        let selection = window.activeTextEditor?.selection;
        const headerFile = window.activeTextEditor?.document;
        if (!this.isInsideClass(headerFile, selection)) {
            selection = this.selectFirstClassDeceleration(window.activeTextEditor?.document);
        }
        let info = new ClassInformation(headerFile, selection);
        if (!info.isValid()) {
            const selection = this.selectFirstClassDeceleration(window.activeTextEditor?.document);
            info = new ClassInformation(headerFile, selection);
        }
        return info;
    }
    static findMissingImplementations(): string[] | null {
        const info = this.getClassInformationFromActiveDocument();
        if (!info) {
            return null;
        }
        let classFunctions = info.getFunctions(true);
        console.log(classFunctions);

        return classFunctions;
    }

    static isInsideClass(document: TextDocument | undefined, selection: Selection | undefined): boolean {
        console.log("isInsideClass");
        if (!document || !selection) {
            console.log("isInsideClass no doc or selection, exiting");
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
        // const { activeTab } = window.tabGroups.activeTabGroup;

        // window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => tab.label))
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

        // for (let i = 0; i < docs.length; i++) {
        //     console.log(`document${i}: ${docs[i].fileName}`);
        // }

        // let bareFilename = path.basename(fileName, extension);
        // var missing = ClassWorker.findMissingImplementations();
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

    // static addMissingImplementations(context: ExtensionContext) {

    //     const wed = context.
    // }
}
