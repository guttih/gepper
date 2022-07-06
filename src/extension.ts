// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from "vscode";
import {
    workspace,
    ExtensionContext,
    window,
    ViewColumn,
    commands,
    Uri,
    TextDocument,
    FileSystemProvider,
    OpenDialogOptions,
    OutputChannel,
} from "vscode";
import { ClassCreator, OpenAfterClassCreation } from "./classCreator";
import { TokenWorker } from "./tokenWorker";
import { Executioner } from "./executioner";
import { Downloader, UrlFileLinker } from "./downloader";
import { DiskFunctions } from "./diskFunctions";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated

    let outputChannel: OutputChannel | null = null;
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    let onSaveCppFile = workspace.onDidSaveTextDocument((document: TextDocument) => {
        // if (document.languageId === "yourid" && document.uri.scheme === "file") {
        if (document.languageId === "cpp") {
            // console.log(`${document.fileName} saved!`);
            // let bla = vscode.env.shell;
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

    const createNewClass = (className: string | undefined, dir?: string): ClassCreator | null => {
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
    };
    let fnCreateClass = commands.registerCommand("gepper.createClass", async () => {
        let className: string | undefined = await window.showInputBox({
            title: "What is the name of your class",
            placeHolder: "ClassName",
            prompt: "Creates a class saved in ClassName.h and ClassName.cpp",
        });

        createNewClass(className);
    });

    let fnCreateClassInFolder = commands.registerCommand("gepper.createClassInFolder", async (context) => {
        let className: string | undefined = await window.showInputBox({
            title: "What is the name of your class",
            placeHolder: "ClassName",
            prompt: "Creates a class saved in ClassName.h and ClassName.cpp",
        });

        createNewClass(className, context.path);
    });

    let createProject = async (projectRoot: Uri, context: any) => {
        return new Promise<string>(async (resolve, rejects) => {
            console.log(projectRoot.fsPath);
            if (!DiskFunctions.dirExists(projectRoot.fsPath)) {
                const msg = "No project project directory selected, quitting";
                window.showErrorMessage(msg);
                rejects(msg);
            }
            const prefix = "https://raw.githubusercontent.com/guttih/sandbox/classer-googletest";
            const list: Array<UrlFileLinker> | null = await Downloader.downloadFileList(
                Uri.parse(`${prefix}/cppDirFileList.txt`),
                Uri.parse(`${prefix}/cpp`),
                projectRoot
            );
            if (!list) {
                const msg = "Unable to download project file list!";
                window.showErrorMessage(msg);
                rejects(msg);
            } else {
                if (outputChannel === null) {
                    outputChannel = window.createOutputChannel("gepper create project");
                }
                outputChannel.clear();
                outputChannel.show(false);
                let msg: string;
                msg = `*************************************************************************\n`;
                msg += `*                                                                       *\n`;
                msg += `*    Creating C++ CMake project with CTests and GoogleTests examples    *\n`;
                msg += `*                                                                       *\n`;
                msg += `*************************************************************************\n\n`;
                outputChannel?.append(msg);
                await Downloader.downloadFileCollection(list, outputChannel)
                    .then((downloadCount) => {
                        let msg: string;
                        if (downloadCount === list.length) {
                            let pad: string = " ".repeat(downloadCount.toString().length / 2);
                            msg = `\n ${pad}${downloadCount} files created.\n\n Project created successfully at ${DiskFunctions.getDirectoryFromFilePath(
                                projectRoot.fsPath
                            )}/`;
                            // window.showInformationMessage(msg);
                        } else {
                            msg = `Error creating project in ${projectRoot},\ņ  only ${downloadCount} of ${list.length} files where created`;
                            window.showErrorMessage(msg);
                        }
                        outputChannel?.append(`${msg}\n`);
                    })
                    .catch(() => {
                        window.showErrorMessage(`Error downloading files.`);
                    });
            }
        });
    };

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
                            await createProject(fileUri[0], context);
                        }
                    });
            } else {
                await createProject(workspace.workspaceFolders[0].uri, context);
            }
        }
    });

    context.subscriptions.push(fnCreateClass, fnCreateClassInFolder, onSaveCppFile, fnCreateCMakeProject);
}

// this method is called when your extension is deactivated
export function deactivate() {}
