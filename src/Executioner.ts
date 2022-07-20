import * as cp from "child_process";
import { basename, dirname } from "path";
import { TokenWorker, ExecutionToken } from "./TokenWorker";

export interface ExecException extends Error {
    cmd?: string | undefined;
    killed?: boolean | undefined;
    code?: number | undefined;
    signal?: NodeJS.Signals | undefined;
    stdout: string | null;
    stderr: string | null;
}

export class Executioner {
    static replaceTokens(text: string, fullFilename: string): string {
        const dir = dirname(fullFilename);
        const name = basename(fullFilename);
        let ret: string;
        ret = TokenWorker.replaceAll(text, TokenWorker.createToken(ExecutionToken.filePath), dir);
        ret = TokenWorker.replaceAll(ret, TokenWorker.createToken(ExecutionToken.fileName), name);
        return ret;
    }
    static run(command: string) {
        return new Promise<ExecException | null>((resolve: any, reject: any) => {
            cp.exec(command, (err, stdout, stderr) => {
                console.log("stdout: " + stdout);
                console.log("stderr: " + stderr);
                if (err) {
                    const ret: ExecException = {
                        ...err,
                        stdout,
                        stderr,
                    };
                    reject(ret);
                }
                resolve(null);
            });
        });
    }
}
