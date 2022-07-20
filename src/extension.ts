
import {
    workspace,
    ExtensionContext,
    window,
    commands,
    TextDocument,
    OutputChannel,
    TextEditor,
    TextDocumentChangeEvent,
    TextEditorSelectionChangeEvent,
} from "vscode";
import { Executioner } from "./Executioner";
import { DiskFunctions } from "./DiskFunctions";
import { ClassWorker } from "./ClassWorker";
import { MenuEditorHandler } from "./MenuEditorHandler";
import { Projector } from "./Projector";
let editorMenuHandler: MenuEditorHandler = new MenuEditorHandler();

export function activate(context: ExtensionContext) {

    window.showInformationMessage("Activating  gepper");
    let outputChannel: OutputChannel | null = null;

    let onSaveCppFile = workspace.onDidSaveTextDocument((document: TextDocument) => {
        if (document.languageId === "cpp") {
            const configPropertyPath = "cpp.gepper.shellExecute.OnSave.Command";
            const cmd = workspace.getConfiguration().get<string>(configPropertyPath);
            if (cmd) {
                Executioner.run(Executioner.replaceTokens(cmd, document.fileName)).catch((err) => {
                    window.showErrorMessage(`Error running onSave command: \n${cmd}`, {
                        detail: `\n\nError:${JSON.stringify(err, null, 2)}\nChange the command in settings by searching for:\n${configPropertyPath} `,
                        modal: true,
                    });
                });
            }
        }
    });

    let fnOnDidChangeActiveTextEditor = window.onDidChangeActiveTextEditor((editor: TextEditor | undefined) => {
        editorMenuHandler.selectVisibleMenuItems(editor ? editor : null, null, undefined);
    });
    let fnOnDidChangeTextEditorSelection = window.onDidChangeTextEditorSelection((e: TextEditorSelectionChangeEvent) => {
        editorMenuHandler.selectVisibleMenuItems(e.textEditor, null, undefined);
    });
    let fnOnDidChangeTextDocument = workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
        editorMenuHandler.selectVisibleMenuItems(null, e.document, undefined);
    });

    let fnCreateClass = commands.registerCommand("gepper.createClass", async () => {
        let className: string | undefined = await window.showInputBox({
            title: "What is the name of your class",
            placeHolder: "ClassName",
            prompt: "Creates a class saved in ClassName.h and ClassName.cpp",
        });

        ClassWorker.createNewClass(className);
    });

    let fnCreateClassInFolder = commands.registerCommand("gepper.createClassInFolder", async (context) => {
        let className: string | undefined = await window.showInputBox({
            title: "What is the name of your class",
            placeHolder: "ClassName",
            prompt: "Creates a class saved in ClassName.h and ClassName.cpp",
        });

        ClassWorker.createNewClass(className, context.path);
    });
    let fnClassImplementMissingFunctions = commands.registerCommand("gepper.classImplementMissingFunctions", async () => {
        await ClassWorker.implementMissingClassFunctions(true, true);
    });

    let fnAddClassOperators = commands.registerCommand("gepper.addClassOperators", async (context) => {
       
        const ret = await ClassWorker.addClassOperators();
    });
    let fnCreateCMakeProject = commands.registerCommand("gepper.createCMakeProject", async (context) => {
        let answer = await window.showWarningMessage("Are you you  sure you want to create a new C++ GoogleTest project here?", "Yes", "No");
        if (answer === "Yes") {
            if (!workspace.workspaceFolders || !DiskFunctions.dirExists(workspace.workspaceFolders[0].uri.fsPath)) {
                window
                    .showOpenDialog({
                        canSelectMany: false,
                        canSelectFolders: true,
                        canSelectFiles: false,
                        openLabel: "Select project directory",
                    })
                    .then(async (fileUri) => {
                        if (fileUri && fileUri[0]) {
                            await Projector.createProject(fileUri[0], outputChannel);
                        }
                    });
            } else {
                await Projector.createProject(workspace.workspaceFolders[0].uri, outputChannel);
            }
        }
    });

    context.subscriptions.push(
        fnCreateClass,
        fnCreateClassInFolder,
        onSaveCppFile,
        fnCreateCMakeProject,
        fnAddClassOperators,
        fnClassImplementMissingFunctions,
        fnOnDidChangeTextDocument,
        fnOnDidChangeTextEditorSelection,
        fnOnDidChangeActiveTextEditor
    );

    //Run the menu check, at extension activation.
    editorMenuHandler.selectVisibleMenuItems(window.activeTextEditor ? window.activeTextEditor : null, null, undefined);
}
