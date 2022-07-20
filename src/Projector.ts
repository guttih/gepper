import { OutputChannel, Uri, window } from "vscode";
import { DiskFunctions } from "./DiskFunctions";
import { Downloader, UrlFileLinker } from "./Downloader";

export class Projector {

    static async createProject(projectRoot: Uri, outputChannel: OutputChannel|null) {
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

}