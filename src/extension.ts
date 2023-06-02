// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ClassCreator, OpenAfterClassCreation } from "./classCreator";
import { TokenWorker } from "./tokenWorker";
import { Executioner } from "./executioner";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "gepper" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    let onSaveCppFile = vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
        // if (document.languageId === "yourid" && document.uri.scheme === "file") {
        if (document.languageId === "cpp") {
            // console.log(`${document.fileName} saved!`);
            // let bla = vscode.env.shell;
            const configPropertyPath = "cpp.gepper.shellExecute.OnSave.Command";
            const cmd = vscode.workspace.getConfiguration().get<string>(configPropertyPath);
            if (cmd) {
                Executioner.run(Executioner.replaceTokens(cmd, document.fileName)).catch((err) => {
                    vscode.window.showErrorMessage(`Error running onSave command: \n${cmd}`, {
                        detail: `\n\nError:${JSON.stringify(err, null, 2)}\nChange the command in settings by searching for:\n${configPropertyPath} `,
                        modal: true,
                    });
                });
            }
        }
    });

    const createNewClass = (className: string | undefined, dir?: string): ClassCreator | null => {
        if (TokenWorker.isOnlySpaces(className)) {
            return null;
        }
        const maker = new ClassCreator(String(className), dir);
        if (!maker.saveClassFiles()) {
            vscode.window.showErrorMessage(`Unable to create Class "${className} in directory ${maker.getDir()}"!`);
            return null;
        }

        switch (maker.getRawClassCreatedShowFile()) {
            case OpenAfterClassCreation.headerFile:
                vscode.workspace.openTextDocument(maker.getHeaderFileName(true)).then((doc) => {
                    vscode.window.showTextDocument(doc, {
                        viewColumn: vscode.ViewColumn.Active,
                    });
                });
                break;
            case OpenAfterClassCreation.sourceFile:
                vscode.workspace.openTextDocument(maker.getImplementationFileName(true)).then((doc) => {
                    vscode.window.showTextDocument(doc, {
                        viewColumn: vscode.ViewColumn.Active,
                    });
                });
                break;
        }

        return maker;
    };
    let fnCreateClass = vscode.commands.registerCommand("gepper.createClass", async () => {
        let className: string | undefined = await vscode.window.showInputBox({
            title: "What is the name of your class",
            placeHolder: "ClassName",
            prompt: "Creates a class saved in ClassName.h and ClassName.cpp",
        });

        createNewClass(className);
    });

    let fnCreateClassInFolder = vscode.commands.registerCommand("gepper.createClassInFolder", async (context) => {
        let className: string | undefined = await vscode.window.showInputBox({
            title: "What is the name of your class",
            placeHolder: "ClassName",
            prompt: "Creates a class saved in ClassName.h and ClassName.cpp",
        });

        createNewClass(className, context.path);
    });

    context.subscriptions.push(fnCreateClass, fnCreateClassInFolder, onSaveCppFile);
    // vscode.window.showInformationMessage("Gepper is loaded");
}

// this method is called when your extension is deactivated
export function deactivate() {}
