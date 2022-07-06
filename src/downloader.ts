"use strict";

import { downloadDirToExecutablePath } from "@vscode/test-electron/out/util";
import * as fs from "fs";
// import * as mkdirp from "mkdirp";
// import * as http from "http";
import * as https from "https";
import { ExtensionContext, OutputChannel, Uri, window } from "vscode";
import { DiskFunctions } from "./diskFunctions";

export interface UrlFileLinker {
    remoteUrl: Uri;
    localFile: Uri;
}

export class Downloader {
    /**
     * Downloads files from a collection.  You can check if all files where downloaded by comparing the collection.length and the returned value
     * @param collection Array of files to be downloaded
     * @returns Number of downloaded files
     */
    static zeroPad = (pad: string, num: number, places: number) => String(num).padStart(places, pad);
    static downloadFileCollection(collection: Array<UrlFileLinker>, outputChannel: OutputChannel | null = null) {
        return new Promise<number>(async (resolve, reject) => {
            if (!collection || collection.length < 1) {
                reject(0);
            }
            let downloadCount = 0;
            const maxLen = collection.length.toString().length;
            for (let i = 0; i < collection.length; i++) {
                const fileMap = collection[i];
                await this.fetchContent(collection[i].remoteUrl).then((fileContent) => {
                    // console.log(`Writing    : ${collection[i].localFile.fsPath}`);
                    const success = DiskFunctions.writeToFile(fileMap.localFile.fsPath, fileContent, true);
                    if (success) {
                        downloadCount++;
                    } else {
                        console.log(`Error Writing    : ${collection[i].localFile.fsPath}`);
                    }

                    outputChannel?.append(
                        `(${this.zeroPad("0", i + 1, maxLen)}/${collection.length}) ${fileMap.localFile.fsPath} ${success ? "" : ": error"}\n`
                    );
                    outputChannel?.show(false);
                });
            }
            resolve(downloadCount);
        });
    }

    /**
     * Creates a UrlFileLinker array from a array of strings.
     * @param relativeFileList Must be a relative list of files, with now directories and all should start with ./  (shell command:  find . -type f > "../cppDirFileList.txt")
     * @param remoteUrlPrefix Prefix to replace the first char with to create the remote url
     * @param localFilePrefix Prefix to replace the first char with to create the local path
     * @returns Array of UrlFileLinker if there are more than zero elements in it.  Otherwise null.
     */
    static makeUrlArray(relativeFileList: Array<string>, remoteUrlPrefix: Uri, localFilePrefix: Uri): Array<UrlFileLinker> | null {
        const urlList = relativeFileList.filter((item: string) => item.length > 1);
        const ret = urlList.map((relativePath: string) => {
            const container: UrlFileLinker = {
                remoteUrl: Uri.parse(`${remoteUrlPrefix}${relativePath.substring(1)}`),
                localFile: Uri.parse(`${localFilePrefix}${relativePath.substring(1)}`),
            };
            return container;
        });
        return ret && ret.length > 0 ? ret : null;
    }

    /**
     * Downloads a file and assumes that file contains a relative list of files which all start with the path ./
     * @param remoteUri Remote path to the file containing the file list
     * @param remoteUrlPrefix Prefix to replace the first char with to create the remote url
     * @param localFilePrefix Prefix to replace the first char with to create the local path
     * @returns Array of UrlFileLinker.  On error null is returned.
     */
    static async downloadFileList(remoteUri: Uri, remoteUrlPrefix: Uri, localFilePrefix: Uri) {
        let fileList = await this.fetchContent(remoteUri);

        return new Promise<Array<UrlFileLinker> | null>((resolve, reject) => {
            if (!fileList) {
                reject(null);
            }

            let fileArray: Array<string> = fileList.split("\n");

            let fileMap = this.makeUrlArray(fileArray, remoteUrlPrefix, localFilePrefix);
            if (!fileMap) {
                reject(null);
            }
            resolve(fileMap);
        });
    }
    static async fetchContent(uri: Uri) {
        return await this.getRequest(uri.toString());
    }
    static getRequest(fileURL: string) {
        console.log(`url: ${fileURL}`);
        return new Promise<string>((resolve, reject) => {
            const req = https.get(fileURL, (res) => {
                res.setEncoding("utf8");
                let responseBody = "";

                res.on("data", (chunk) => {
                    responseBody += chunk;
                });

                res.on("end", () => {
                    resolve(responseBody);
                });
            });

            req.on("error", (err) => {
                reject(err);
            });

            req.end();
        });
    }
}
