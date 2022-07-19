// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from "vscode";
import { workspace, ExtensionContext, window, ViewColumn, commands, Uri, TextDocument, OutputChannel, TextEditor, Selection, Position } from "vscode";
import { ClassCreator, OpenAfterClassCreation } from "./ClassCreator";
import { TokenWorker } from "./TokenWorker";
import { Executioner } from "./Executioner";
import { Downloader, UrlFileLinker } from "./Downloader";
import { DiskFunctions } from "./DiskFunctions";
import { ClassWorker } from "./ClassWorker";
import { ClassInformation } from "./ClassInformation";
let handleMenuShow: NodeJS.Timeout;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    window.showInformationMessage("activating  gepper");
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

    commands.executeCommand("setContext", "gepper.showEditClassMenu", true);

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
    let fnClassImplementMissingFunctions = commands.registerCommand("gepper.classImplementMissingFunctions", async (context) => {
        //Make ClassInformation
        window.showInformationMessage("fnClassImplementMissingFunctions");
        let info: ClassInformation = ClassWorker.getClassInformationFromActiveDocument();
        if (!info.isValid()) {
            window.showWarningMessage(`Could not parse class in file`);
            return;
        }
        let missing = info.getFunctions(true);
        if (!missing || missing.length < 1) {
            return; //nothing to do
        }

        const ret = ClassWorker.findImplementationFile(info.name, window.activeTextEditor?.document.fileName);
        if (ret === null) {
            window.showWarningMessage("Could not find a file to put the implementations to");
            return;
        }
        let doc: TextDocument;
        if (typeof ret === "string") {
            //We did not get an open document, but we got the location of one, so we will need to open it
            doc = await workspace.openTextDocument(ret);
        } else {
            doc = ret;
        }
        info.setImplementation(doc);
        let headFuncs = info.getFunctions(true);
        let implFuncs = info.getImplementedFunctions();
        let missingFuncs = info.getMissingFunctions(headFuncs, implFuncs, `${info.name}::`);

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
                    let last = doc.lineAt(doc.lineCount-1);
                    editor.selection=new Selection(new Position(docLengthBefore, 0), last.range.end);
                    editor.revealRange(editor.selection);
                });
        }

        console.log(`This doc is selected: ${doc.fileName}`);
    });

    const createProject = async (projectRoot: Uri, context: any) => {
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
                        resolve(msg);
                    })
                    .catch(() => {
                        window.showErrorMessage(`Error downloading files.`);
                    });
            }
        });
    };

    let fnAddClassOperators = commands.registerCommand("gepper.addClassOperators", async (context) => {
        window
            .showQuickPick(
                [
                    {
                        label: "Class Assignment operator",
                        description: " Class1 = Class2",
                        picked: false,
                        detail: "Og hér er mikill deteill um allann þennan operator og svoleiðis stuff",
                    },
                    {
                        label: "Class Equality operator",
                        description: " Class1 == Class2",
                        picked: true,
                        detail: "asdfas Bull og sull dúddi dfasdf",
                    },
                ],
                {
                    title: "Add operators to a C++ Class",
                    placeHolder: "Please select which operators to you want to add!",
                    canPickMany: true,
                }
            )
            .then((data) => {
                if (data) {
                    let msg = "Todo: Now I should add these operators:\n";
                    if (data.length < 1) {
                        msg = "Nothing selected!";
                    } else {
                        data.forEach((e) => (msg += `  - ${e.label}\n`));
                    }
                    window.showInformationMessage(msg, { modal: true });
                }

                console.log(data);
            });
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
                            await createProject(fileUri[0], context);
                        }
                    });
            } else {
                await createProject(workspace.workspaceFolders[0].uri, context);
            }
        }
    });

    const shouldShowMenuItemAddMissingImplementations = (editor: TextEditor, document: TextDocument | null, selections: readonly Selection[]) => {
        console.log("shouldShowMenuItemAddMissingImplementations");
        let selection: Selection | undefined = selections && selections.length > 0 ? selections[0] : undefined;
        let shouldShowMenu = false;
        if (editor) {
            shouldShowMenu = ClassWorker.isInsideClass(editor.document, selection);
            if (!shouldShowMenu) {
                //no class selected, let's try to select the first one
                let selection = ClassWorker.selectFirstClassDeceleration(editor.document);
                console.log(`shouldShowMenuItemAddMissingImplementations selected first class: ${selection !== null}`);
                if (selection) {
                    shouldShowMenu = ClassWorker.isInsideClass(editor.document, selection);
                }

                clearTimeout(handleMenuShow);
                shouldShowMenuItemAddMissingImplementations(editor, document, selections);
                handleMenuShow = setTimeout(() => shouldShowMenuItemAddMissingImplementations(editor, document, selections), 30);
            }
        }
    };
    context.subscriptions.push(
        fnCreateClass,
        fnCreateClassInFolder,
        onSaveCppFile,
        fnCreateCMakeProject,
        fnAddClassOperators,
        fnClassImplementMissingFunctions
    );
}
