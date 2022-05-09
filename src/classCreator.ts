import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { DiskFunctions } from "./diskFunctions";
import { TokenWorker, FunctionTokenName, TokenInfo } from "./tokenWorker";

export class ClassCreator {
    /**
     * Loads the class header template and replaces all stored function tokens.
     * @returns a string which can be saved to a new class header file (.h)
     */
    createHeaderContent(): string | undefined {
        let template = this.getRawHeaderFileName();
        if (!template) {
            return template;
        }
        return this.replaceFunctionalTokens(template);
    }

    /**
     * Loads the class implementation template and replaces all stored function tokens.
     * @returns a string which can be saved to a new class implementation file (.cpp)
     */
    createImplementationContent(): string | undefined {
        let template = this.getRawImplementationFileName();
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

    executeTokenFunction(
        tokenFunc: FunctionTokenName,
        content: string
    ): string {
        switch (tokenFunc) {
            case FunctionTokenName.className:
                content = TokenWorker.replaceAll(
                    content,
                    TokenWorker.getFunctionalTokenInfo(tokenFunc).token,
                    this.getName()
                );
                break;
            case FunctionTokenName.classNameUpperCase:
                content = TokenWorker.replaceAll(
                    content,
                    TokenWorker.getFunctionalTokenInfo(tokenFunc).token,
                    TokenWorker.toUpper(this.getName())
                );
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
                content = TokenWorker.replaceAll(
                    content,
                    TokenWorker.getFunctionalTokenInfo(tokenFunc).token,
                    this.getHeaderFileName()
                );
                break;
            case FunctionTokenName.classImplementationFileName:
                content = TokenWorker.replaceAll(
                    content,
                    TokenWorker.getFunctionalTokenInfo(tokenFunc).token,
                    this.getImplementationFileName()
                );
                break;

            case FunctionTokenName.classHeaderFileNameLower:
                content = TokenWorker.replaceAll(
                    content,
                    TokenWorker.getFunctionalTokenInfo(tokenFunc).token,
                    TokenWorker.toLower(this.getHeaderFileName(), "-")
                );
                break;
            case FunctionTokenName.classImplementationFileNameLower:
                content = TokenWorker.replaceAll(
                    content,
                    TokenWorker.getFunctionalTokenInfo(tokenFunc).token,
                    TokenWorker.toLower(this.getImplementationFileName(), "-")
                );
                break;
            case FunctionTokenName.classHeaderFileNameLowerUnder:
                content = TokenWorker.replaceAll(
                    content,
                    TokenWorker.getFunctionalTokenInfo(tokenFunc).token,
                    TokenWorker.toLower(this.getHeaderFileName(), "_")
                );
                break;
            case FunctionTokenName.classImplementationFileNameLowerUnder:
                content = TokenWorker.replaceAll(
                    content,
                    TokenWorker.getFunctionalTokenInfo(tokenFunc).token,
                    TokenWorker.toLower(this.getImplementationFileName(), "_")
                );
                break;
        }
        return content;
    }

    #_name: string = "";
    #_fileNameHeader: string = "";
    #_fileNameImplementation: string = "";
    #_dir?: string;

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
        return includePath
            ? `${this.#_dir}/${this.#_fileNameHeader}`
            : this.#_fileNameHeader;
    }

    /**
     * @param includePath if true a directory path will be added in front of the file name rendering it a fully qualified file path.
     * @returns name of the implementation file (*.cpp)
     */
    getImplementationFileName(includePath: Boolean = false) {
        return includePath
            ? `${this.#_dir}/${this.#_fileNameImplementation}`
            : this.#_fileNameImplementation;
    }
    /**
     * Saves the class in two files.
     * @returns On success: true.  On fail: false.
     */
    saveClassFiles() {
        if (!this.isValid()) {
            return false;
        }

        return false;
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
        this.#_fileNameHeader = `${this.#_name}.h`;
        this.#_fileNameImplementation = `${this.#_name}.cpp`;

        // let tokenArray = TokenWorker.getFunctionalTokens();

        let template = this.getRawHeaderFileName();
        this.#_fileNameHeader = template
            ? this.replaceFunctionalTokens(template)
            : `${this.#_name}.h`;

        template = this.getRawImplementationFileName();
        this.#_fileNameImplementation = template
            ? this.replaceFunctionalTokens(template)
            : `${this.#_name}.cpp`;

        // this.replaceFunctionalTokens(template);
        // if (template !== undefined) {
        //     let relevantTokens = tokenArray.filter((element) => {
        //         return template.indexOf(element.token) > -1;
        //     });
        //     relevantTokens.forEach((e) => {
        //         console.log(e.token);
        //         template = this.executeTokenFunction(e.value, template);
        //     });
        // }

        return true;
    }

    #init(className: string, dir?: string) {
        this.#_dir =
            dir ||
            vscode.workspace
                .getConfiguration()
                .get<string>("cpp.gepper.classPath") ||
            vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;

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
        return this.getDir()
            ? DiskFunctions.dirExists(String(this.getDir()))
            : false;
    }

    /**
     * Check if the class object is in valid state or not.
     */
    isValid() {
        return (
            this.#_name.length > 0 &&
            this.#_fileNameHeader.length > 2 &&
            this.#_fileNameImplementation.length > 4 &&
            this.#_dir &&
            this.#_dir.length > 0
        );
    }

    /**
     * Get class header template with un-modified tokens
     * @returns the un-modified template from the package.json file.
     */
    getRawHeaderFileName(): string | undefined {
        return vscode.workspace
            .getConfiguration()
            .get<string>("cpp.gepper.classHeaderFileNameScheme");
    }

    /**
     * Get class implementation template with un-modified tokens
     * @returns the un-modified template from the package.json file.
     */
    getRawImplementationFileName(): string | undefined {
        return vscode.workspace
            .getConfiguration()
            .get<string>("cpp.gepper.classImplementationFileNameScheme");
    }
}
