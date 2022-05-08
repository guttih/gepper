import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class ClassCreator {
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
     * @returns name of the header file (*.h)
     */
    getHeaderFileName() {
        return this.#_fileNameHeader;
    }

    /**
     * @returns name of the implementation file (*.cpp)
     */
    getImplementationFileName() {
        return this.#_fileNameImplementation;
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
}
