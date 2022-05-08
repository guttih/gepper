import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class Maker {
    _dir: string | undefined;
    _args: any;

    constructor(dir: string, args: any) {
        this._dir=dir;
        this._args=args;
    }
    getDir(): string {
        return this._dir === undefined? "goto get path" : this._dir;
    }
}
