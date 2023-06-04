import * as fs from "fs";
import * as path from "path";

export class DiskFunctions {
    static readFromFile(file: string): String | null {
        try {
            return fs.readFileSync(file).toString();
        } catch (err) {
            return null;
        }
    }
    constructor() {}
    static fileExists(file: string) {
        try {
            return fs.statSync(file).isFile();
        } catch (err) {
            return false;
        }
    }
    static dirExists(file: string) {
        try {
            return fs.statSync(file).isDirectory();
        } catch (err) {
            return false; 
        }
    }
    /**
     * Extract a path from a path to a file
     * @param path path to a file (must include a directory / or \\ )
     * @returns if path not found an empty string is returned
     */
    static getDirectoryFromFilePath(filePath: string): string {
        return path.dirname(filePath);
      }
    static createDirectory(dir: string, createPathRecursively: boolean = false): Boolean {
        try {
            if (!DiskFunctions.dirExists(dir)) {
                return fs.mkdirSync(dir, { recursive: createPathRecursively }) !== undefined;
            }
        } catch (err) {
            return false;
        }
        return true;
    }
    static writeToFile(file: string, content: string, createPath: boolean = false): Boolean {
        try {
            if (createPath) {
                const dir = this.getDirectoryFromFilePath(file);
                if (dir.length < 1) {
                    return false;
                }
                if (!this.createDirectory(dir, true)) {
                    return false;
                }
            }
            fs.writeFileSync(file, content);
            return true;
        } catch (err) {
            return false;
        }
    }
    static deleteFile(file: string): Boolean {
        try {
            fs.unlinkSync(file);
            return true;
        } catch (err) {
            return false;
        }
    }
}
