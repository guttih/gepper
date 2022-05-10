// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { ClassCreator } from "./classCreator";
import { TokenWorker } from "./tokenWorker";
import { DiskFunctions } from "./diskFunctions";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "gepper" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand("gepper.helloWorld", () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage("Hello World from gepper!");
    });

    const createNewClass = (className: string | undefined, dir?: string): Boolean => {
        if (TokenWorker.isOnlySpaces(className)) {
            return false;
        }
        const maker = new ClassCreator(String(className), dir);
        if (!maker.saveClassFiles()) {
            vscode.window.showErrorMessage(`Unable to create Class "${className} in directory ${maker.getDir}"!`);
            return false;
        }
        return true;
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

    context.subscriptions.push(fnCreateClass, fnCreateClassInFolder, disposable);
    vscode.window.showInformationMessage("Gepper is loaded");
}

// this method is called when your extension is deactivated
export function deactivate() {}
