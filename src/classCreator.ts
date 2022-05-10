import * as vscode from "vscode";
import * as path from "path";
import { DiskFunctions } from "./diskFunctions";
import { TokenWorker, FunctionTokenName, TokenInfo } from "./tokenWorker";
import { platform } from "process";

export class ClassCreator {
    #_name: string = "";
    #_dir?: string;
    /**
     * Loads the class header template and replaces all stored function tokens.
     * @returns a string which can be saved to a new class header file (.h)
     */
    getHeaderContent(): string | undefined {
        let template = this.getRawHeaderContent();
        if (!template) {
            return template;
        }
        return this.replaceFunctionalTokens(template);
    }

    /**
     * Loads the class implementation template and replaces all stored function tokens.
     * @returns a string which can be saved to a new class implementation file (.cpp)
     */
    getImplementationContent(): string | undefined {
        let template = this.getRawImplementationContent();
        if (!template) {
            return template;
        }
        return this.replaceFunctionalTokens(template);
    }
    replaceFunctionalTokens(template: string): string {
        let content = template;
        let tokenArray = TokenWorker.getFunctionalTokens().filter((element) => {
            return template.indexOf(element.token) > -1;
        });
        tokenArray.forEach((ft) => {
            content = this.executeTokenFunction(ft.value, content);
        });
        return content;
    }

    executeTokenFunction(tokenFunc: FunctionTokenName, content: string): string {
        switch (tokenFunc) {
            case FunctionTokenName.className:
                content = TokenWorker.replaceAll(content, TokenWorker.getFunctionalTokenInfo(tokenFunc).token, this.getName());
                break;
            case FunctionTokenName.classNameUpperCase:
                content = TokenWorker.replaceAll(content, TokenWorker.getFunctionalTokenInfo(tokenFunc).token, TokenWorker.toUpper(this.getName()));
                break;
            case FunctionTokenName.classNameLowerCaseUnder:
                content = TokenWorker.replaceAll(
                    content,
                    TokenWorker.getFunctionalTokenInfo(tokenFunc).token,
                    TokenWorker.toLower(this.getName(), "_")
                );
                break;
            case FunctionTokenName.classNameLowerCaseDash:
                content = TokenWorker.replaceAll(
                    content,
                    TokenWorker.getFunctionalTokenInfo(tokenFunc).token,
                    TokenWorker.toLower(this.getName(), "-")
                );
                break;

            case FunctionTokenName.classNameCapitalizeFirst:
                content = TokenWorker.replaceAll(
                    content,
                    TokenWorker.getFunctionalTokenInfo(tokenFunc).token,
                    TokenWorker.capitalizeFirst(this.getName())
                );
                break;
            case FunctionTokenName.classHeaderFileName:
                content = TokenWorker.replaceAll(content, TokenWorker.getFunctionalTokenInfo(tokenFunc).token, this.getHeaderFileName());
                break;
            case FunctionTokenName.classImplementationFileName:
                content = TokenWorker.replaceAll(content, TokenWorker.getFunctionalTokenInfo(tokenFunc).token, this.getImplementationFileName());
                break;
            case FunctionTokenName.classNameLowerCase:
                content = TokenWorker.replaceAll(content, TokenWorker.getFunctionalTokenInfo(tokenFunc).token, TokenWorker.toLower(this.getName()));
                break;
        }
        return content;
    }

    /**
     * @param className Name of the class
     * @param dir optional parameter for where to store the class
     */
    constructor(className: string, dir?: string) {
        this.#init(className, dir);
    }
    getDir() {
        return this.#_dir;
    }

    /**
     * @returns Name of the class
     */
    getName() {
        return this.#_name;
    }

    /**
     * @param includePath if true a directory path will be added in front of the file name rendering it a fully qualified file path.
     * @returns name of the header file (*.h)
     */
    getHeaderFileName(includePath: Boolean = false) {
        let template = this.getRawHeaderFileName();
        let fileNameHeader = template ? this.replaceFunctionalTokens(template) : `${this.#_name}.h`;

        return includePath ? `${this.#_dir}/${fileNameHeader}` : fileNameHeader;
    }

    /**
     * @param includePath if true a directory path will be added in front of the file name rendering it a fully qualified file path.
     * @returns name of the implementation file (*.cpp)
     */
    getImplementationFileName(includePath: Boolean = false) {
        let template = this.getRawImplementationFileName();
        let fileNameHeader = template ? this.replaceFunctionalTokens(template) : `${this.#_name}.cpp`;

        return includePath ? `${this.#_dir}/${fileNameHeader}` : fileNameHeader;
    }
    /**
     * Saves the class in two files.
     * @returns On success: true.  On fail: false.
     */
    saveClassFiles() {
        if (!this.isValid()) {
            return false;
        }
        const headerContent = this.getHeaderContent();
        const sourceContent = this.getImplementationContent();
        const dir = this.getDir();
        if (dir === undefined || headerContent === undefined || sourceContent === undefined) {
            return false;
        }
        if (!DiskFunctions.writeToFile(this.getHeaderFileName(true), headerContent)) {
            return false;
        }

        return DiskFunctions.writeToFile(this.getImplementationFileName(true), sourceContent);
    }

    /**
     * Checks if a class name is valid.
     * @param name Class name to check
     * @returns true if class name is valid otherwise false
     */
    static isClassNameValid(name?: string) {
        if (!name) {
            return false;
        }
        var pattern = /^([_a-zA-Z]).([_a-zA-Z0-9_])+([_a-zA-Z0-9_])$/;
        return pattern.test(name);
    }
    /**
     * Set name of the class and if successful, names of
     * header file and implementation file will also be set.
     * @param className New class name
     * @returns true if success
     */
    #setName(className: string) {
        if (!ClassCreator.isClassNameValid(className)) {
            return false;
        }
        this.#_name = className;

        return true;
    }

    #init(className: string, dir?: string) {
        this.#_dir =
            dir || vscode.workspace.getConfiguration().get<string>("cpp.gepper.classPath") || vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
        if (this.#_dir && this.#_dir.length > 0 && vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath) {
            //Make relative path
            let workDir = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
            let dir = this.#_dir;
            if (platform === "win32") {
                if (dir.length === 1 || (dir.length > 1 && dir[1] !== ":")) {
                    this.#_dir = path.join(workDir, dir);
                }
            } else {
                //linux
                if (dir !== "/") {
                    this.#_dir = path.join(workDir, dir);
                }
            }
        }
        this.#setName(className);
    }

    /**
     * Checks if header file exists.
     * @returns true if it exists, false if not
     */
    headerFileExists() {
        return DiskFunctions.fileExists(this.getHeaderFileName(true));
    }
    /**
     * Checks if implementation file exists.
     * @returns true if it exists, false if not
     */

    implementationFileExists() {
        return DiskFunctions.fileExists(this.getImplementationFileName(true));
    }

    pathExists() {
        return this.getDir() ? DiskFunctions.dirExists(String(this.getDir())) : false;
    }

    /**
     * Check if the class object is in valid state or not.
     */
    isValid() {
        return ClassCreator.isClassNameValid(this.getName()) && this.#_dir && this.#_dir.length > 0;
    }

    /**
     * Get class header template with un-modified tokens
     * @returns the un-modified template from the package.json file.
     */
    getRawHeaderFileName(): string | undefined {
        return vscode.workspace.getConfiguration().get<string>("cpp.gepper.classHeaderFileNameScheme");
    }

    /**
     * Get class implementation template with un-modified tokens
     * @returns the un-modified template from the package.json file.
     */
    getRawImplementationFileName(): string | undefined {
        return vscode.workspace.getConfiguration().get<string>("cpp.gepper.classImplementationFileNameScheme");
    }

    getRawHeaderContent(): string | undefined {
        return vscode.workspace.getConfiguration().get<string>("cpp.gepper.classHeaderTemplate");
    }
    getRawImplementationContent(): string | undefined {
        return vscode.workspace.getConfiguration().get<string>("cpp.gepper.classImplementationTemplate");
    }
}
