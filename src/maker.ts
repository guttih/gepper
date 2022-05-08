import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class Maker {
    _dir: string|undefined;

    constructor(dir: string|undefined) {
        this._dir=dir;
    }
    getDir(): string {
        return this._dir === undefined? "goto get path" : this._dir;
    }
}
