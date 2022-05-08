// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Maker } from './maker';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "gepper" is now active!');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('gepper.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from gepper!');
	});
	let fnCreateClass = vscode.commands.registerCommand('gepper.createClass', (args) => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		let got = vscode.workspace.getConfiguration().get("cpp.gepper.classPath");
		let dir ="bull";
		let maker = new Maker(dir, args);
		// fs.writeFile(vscode.)
		vscode.window.showInformationMessage('Class created');
	});

	context.subscriptions.push(disposable, fnCreateClass);
	vscode.window.showInformationMessage('Gepper is loaded');
}

// this method is called when your extension is deactivated
export function deactivate() {}
