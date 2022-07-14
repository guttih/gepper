import { window, TextDocument, ExtensionContext, WorkspaceEdit, Selection, Position, Range } from "vscode";
import { ClassInformation } from "./ClassInformation";

export class ClassWorker {
    static msg(msg: string) {
        window.showInformationMessage("ClassWorker:" + msg);
    }
    static findMissingImplementations(context: ExtensionContext) {
        // if (window.activeTextEditor && window.activeTextEditor.selection) {
        //     if (window.activeTextEditor) {
        //         var activeEditor = window.activeTextEditor;
        //         var selections = activeEditor.selections;
        //         selections = selections.sort((a:Selection, b: Selection) => a.start.isAfter(b.start) ? 1 : -1);
        //         create(activeEditor, activeEditor.selections, activeEditor);
        //     }
        // }
        const selection = window.activeTextEditor?.selection;
        const headerFile = window.activeTextEditor?.document;
        if (!this.isInsideClass(headerFile, selection)) {
            return;
        }
        const info = new ClassInformation(headerFile, selection);
        if (!info.isValid()) {
            return;
        }
        let classFunctions=info.getFunctions();
        console.log(classFunctions);
    }

    static isInsideClass(document: TextDocument | undefined, selection: Selection | undefined): boolean {
        console.log("isInsideClass");
        if (!document || !selection) {
            console.log("isInsideClass");
            return false;
        }
        // let text = document.getText();
        // text = text.replace(/\s/g, " ");
        // var firstLine = document.lineAt(0);
        // var lastLine = document.lineAt(document.lineCount - 1);
        let selectedLineIndex = selection.active.line < selection.anchor.line ? selection.active.line : selection.anchor.line;
        // let lineAboveSelected = document.lineAt(selectedLineIndex - 1);
        // let lineBelowSelected = document.lineAt(selectedLineIndex + 1);
        let selectedLine = document.lineAt(selectedLineIndex);
        let current: string = selectedLine.text.replace(/\s/g, " ").trim();
        const i = current.indexOf("class ");
        return i > -1;
        // let aboveRange = new Range(new Position(0, 0), lineAboveSelected.range.end);
        // let belowRange = new Range(lineBelowSelected.range.start, lastLine.range.end);
        // let aboveText = document.getText(aboveRange);
        // let belowText = document.getText(belowRange);
        // console.log("Above---------------start");
        // console.log(aboveText);
        // console.log("Above---------------end");
        // console.log("Select--------------start");
        // console.log(selectedLine.text);
        // console.log("Select--------------end");
        // console.log("below---------------start");
        // console.log(belowText);
        // console.log("below---------------end");

        // console.log(line);
        return false;
        // if (window.activeTextEditor && window.activeTextEditor.selection) {
        //     let fileName = window.activeTextEditor?.document.fileName;
        //     let name = fileName.replace(/^.*[\\\/]/, '').replace(/\.[^\.]+$/, '');
        //     // if (window.activeTextEditor) {
        //     //     window.activeTextEditor.insertSnippet(new SnippetString('\n#endif // ' + headerGuard), vscode.window.activeTextEditor.document.positionAt(window.activeTextEditor.document.getText().length));
        //     //     window.activeTextEditor.insertSnippet(new SnippetString('#ifndef ' + headerGuard + '\n#define ' + headerGuard + '\n\n'), window.activeTextEditor.document.positionAt(0));
        //     // }
        // }
        // file.getWordRangeAtPosition({line})
    }
    // static addMissingImplementations(context: ExtensionContext) {

    //     const wed = context.
    // }
}
