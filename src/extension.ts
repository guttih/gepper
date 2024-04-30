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
import { ClassWorker } from "./Class/ClassWorker";
import { MenuEditorHandler } from "./MenuEditorHandler";
import { Projector } from "./Projector";
let editorMenuHandler: MenuEditorHandler = new MenuEditorHandler();

export function activate(context: ExtensionContext) {
    // window.showInformationMessage("Activating  gepper");
    let outputChannel: OutputChannel | null = null;
    let onSaveCppFile = workspace.onDidSaveTextDocument((document: TextDocument) => {
        if (document.languageId === "c" || document.languageId === "cpp") {
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

    let getLastDirIfCapCased = (path: string | undefined): string => {
        if (!path) {
            return "";
        }

        let word = DiskFunctions.getBaseName(path);

        return word.charAt(0).toUpperCase() === word.charAt(0) ? word : "";
    };

    let fnCreateClassInFolder = commands.registerCommand("gepper.createClassInFolder", async (context) => {
        
        let value = getLastDirIfCapCased(context.fsPath) || "ClassName";
        let prompt = `Create a class saved in files ${value}.h and ${value}.cpp`;
        
        let className: string | undefined = await window.showInputBox({
            title: "What is the name of your class",
            placeHolder: "ClassName",
            prompt: prompt,
            value: value,
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

    let fnRemoveDocumentComments = commands.registerCommand("gepper.removeDocumentComments", async (context) => {
        if (context && context.document && (context.document.languageId === "c" || context.document.languageId === "cpp")) {
            await ClassWorker.removeDocumentComments();
        } else {
            window.showErrorMessage(`Remove comments, only supports C++ files.\n\n --  Regards from Gepper.`);
        }
    });

    function convertToAsciiDocHeadingsToMarkdown(text: string): string {
        // Converting AsciiDoc headings to Markdown headings
        return text.replace(/(=+)\s(.+?)\n/g, (match: string, level: string, content: string) => {
            const markdownLevel = level.length;
            return "#".repeat(markdownLevel) + " " + content + "\n";
        });
    }

    
    /**
     *  Converts AsciiDoc User Story document ID links Git issue ID links
     * 
     * 
     * @param content a AsciiDoc text
     * @returns a Markdown text
     */
    function convertUserStoryIdsToGitIssueIds(content: string): string {
        // Converting AsciiDoc headings to Markdown headings

        //ID <<US051>> to be converted to #51
        //remove the last >>
        content =  content.replace(/(?<=US([0]{0,3}\d{1,}))>>/g, "");
        //replacing  <<US051 with #51
        content = content.replace(/<<US([0]{0,3}(?<=\d{1,}))/g, "#");

        return content;

    }

    // Define a function to convert AsciiDoc-style lists with headings to Markdown lists
    function convertToAsciiDocListToMarkdown(content: string): string {
        // Replace heading and list item markers with Markdown list markers


        content = content.replace(/\n\.\.\.\.\.\s/g, "\n                1. ");
        content = content.replace(/\n\.\.\.\.\s/g,   "\n            1. ");
        content = content.replace(/\n\.\.\.\s/g,     "\n        1. ");
        content = content.replace(/\n\.\.\s/g,       "\n    1. ");
        content = content.replace(/\n\.\s/g,       "\n1. ");

        content = content.replace(/\n\*\*\*\*\*\s/g, "\n                * ");
        content = content.replace(/\n\*\*\*\*\s/g,   "\n            * ");
        content = content.replace(/\n\*\*\*\s/g,     "\n        * ");
        content = content.replace(/\n\*\*\s/g,       "\n    * ");
        content = content.replace(/\n\*\s/g,       "\n* ");

        content = content.replace(/\n-----\s/g, "\n                * ");
        content = content.replace(/\n----\s/g,   "\n            * ");
        content = content.replace(/\n---\s/g,     "\n        * ");
        content = content.replace(/\n--\s/g,       "\n    * ");
        content = content.replace(/\n-\s/g,       "\n* ");

        return content
            .replace(/^ - (.+?) -\s*\n/gm, (match: string, heading: string) => {
                return `**${heading}**\n`;
            })
            .replace(/^(\s*)\.\s+(.+?)\s*\n/gm, (match: string, leadingWhitespace: string, item: string) => {
                // Check for leading whitespace to determine if it's a numbered list
                if (leadingWhitespace) {
                    return `${leadingWhitespace}1. ${item}\n`;
                } else {
                    return `${leadingWhitespace}- ${item}\n`;
                }
            });
    }

    /**
     * Converts text to a snippet body
     *
     * @param {string} content the text to be converted
     * @returns {string} Array of strings which can be used in a snippet body.
     */
    function asciiDocContentToMarkdown(content: string): string {
        content = convertToAsciiDocListToMarkdown(content);
        content = convertToAsciiDocHeadingsToMarkdown(content);
        return content;
    }

    let message = commands.registerCommand("gepper.gepperMessage", () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        window.showInformationMessage("Yes, the gepper extension is running!");
    });

    

    let asciiUserStoriesToGitIssue = commands.registerCommand("gepper.selTextUserStoryToIssues", async () => {
        const editor = window.activeTextEditor;
        if (editor) {
            if (editor.selection.isEmpty) {
                window.showErrorMessage("You need select a text first for convert to a snippet");
            } else {
                let txt = editor;
                let content = txt.document.getText(txt.selection);

                let output = convertUserStoryIdsToGitIssueIds(asciiDocContentToMarkdown(content));
                if (outputChannel === null) {
                    outputChannel = window.createOutputChannel("Markdown");
                }
                outputChannel.clear();
                outputChannel.append(output);
                outputChannel.show();
            }
        }
    });

    let asciiToMd = commands.registerCommand("gepper.selTextAsciiDocToMarkdown", async () => {
        const editor = window.activeTextEditor;
        if (editor) {
            if (editor.selection.isEmpty) {
                window.showErrorMessage("You need select a text first for convert to a snippet");
            } else {
                let txt = editor;
                let content = txt.document.getText(txt.selection);

                let output = asciiDocContentToMarkdown(content);
                if (outputChannel === null) {
                    outputChannel = window.createOutputChannel("Markdown");
                }
                outputChannel.clear();
                outputChannel.append(output);
                outputChannel.show();
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
        fnOnDidChangeActiveTextEditor,
        fnRemoveDocumentComments,
        asciiToMd,
        asciiUserStoriesToGitIssue,
    );

    //Run the menu check, at extension activation.
    editorMenuHandler.selectVisibleMenuItems(window.activeTextEditor ? window.activeTextEditor : null, null, undefined);
}
