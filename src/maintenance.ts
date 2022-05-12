import * as path from "path";
import * as fs from "fs";
import { TokenWorker, FunctionTokenName, FunctionalTokenInfo, ExecutionTokenInfo, ExecutionToken } from "./tokenWorker";
import { DiskFunctions } from "./diskFunctions";

export interface TokenDetails {
    name: string;
    value: FunctionTokenName | ExecutionToken;
    token: string;
    description?: string;
    markdownDescription?: string;
}

export class Maintenance {
    static savePackageJsonToDisk(packageJson: any) {
        let newContent = JSON.stringify(packageJson, null, 4);
        let fileName = Maintenance.getPackageJsonFullFileName(); /*  */
        try {
            fs.writeFileSync(fileName, newContent);
            return true;
        } catch (err) {
            console.error(err);
            console.log("Unable to write to file package.json");
            return false;
        }
    }

    /**
     * Replaces everything between two tokens and returns the result.
     * @param content :   Original content which shall be changed.
     * @param startToken  newContent will be inserted after The first instance found matching the text in this token.
     * @param endToken    newContent will be inserted before First instance of this text, found after startToken.
     * @param newContent  New content which will be inserted between the start and end tokens.
     * @returns           On success, the modified content.  On error, the return value is null.
     */
    static replaceContent(content: string, startToken: string, endToken: string, newContent: string): string | null {
        let start = content.indexOf(startToken);
        let end = content.indexOf(endToken, start);
        if (start < 0) {
            console.error(`startToken "${startToken}" not found!`);
            return null;
        }
        if (end < 0) {
            console.error(`endToken "${endToken}" not found!`);
            return null;
        }
        let ret = content.substring(0, start + startToken.length);
        ret += newContent;
        ret += content.substring(end);

        return ret;
    }

    static savePropertiesToSettingsMarkdown(): Boolean {
        let allTokens = TokenWorker.getFunctionalTokens();
        let allExecutionTokens = TokenWorker.getExecutionTokens();
        let fileTokens = allTokens.filter(
            (e) => e.value !== FunctionTokenName.classHeaderFileName && e.value !== FunctionTokenName.classImplementationFileName
        );

        let templateFunctionDescription: string = Maintenance.makeAvailableCommandMarkdownDescription(Maintenance.getDetailedInfo(allTokens, true));
        let fileFunctionMdDesc: string = Maintenance.makeAvailableCommandMarkdownDescription(Maintenance.getDetailedInfo(fileTokens, true));
        let executionMdDesc: string = Maintenance.makeAvailableCommandMarkdownDescription(
            Maintenance.getDetailedExecutionInfo(allExecutionTokens, true)
        );
        const filename = Maintenance.getMarkDownDocumentName("settings.md");
        const mdSettings = DiskFunctions.readFromFile(filename);
        if (!mdSettings === null) {
            return false;
        }
        let newContent = Maintenance.replaceContent(
            String(mdSettings),
            "**Available Class creation template tokens are:**\n\n",
            "#### Class creation naming schema - Properties",
            `${templateFunctionDescription}\n`
        );
        if (!newContent === null) {
            return false;
        }

        newContent = Maintenance.replaceContent(
            String(newContent),
            "**Available Class creation naming schema tokens are:**\n\n",
            "## On save command",
            `${fileFunctionMdDesc}\n`
        );
        if (!newContent === null) {
            return false;
        }
        newContent = Maintenance.replaceContent(
            String(newContent),
            "**Available On save command tokens are:**\n\n",
            "----------\n",
            `${executionMdDesc}\n`
        );
        if (!newContent === null) {
            return false;
        }
        
        return DiskFunctions.writeToFile(filename, String(newContent));
    }
    static updateAllTokenPropertyDescriptions(packageJson: any): Boolean {
        let allTokens = TokenWorker.getFunctionalTokens();
        let allExecutionTokens = TokenWorker.getExecutionTokens();
        let fileTokens = allTokens.filter(
            (e) => e.value !== FunctionTokenName.classHeaderFileName && e.value !== FunctionTokenName.classImplementationFileName
        );

        let templateFunctionDescription: string = Maintenance.makeAvailableCommandMarkdownDescription(Maintenance.getDetailedInfo(allTokens, true));
        let fileFunctionMdDesc: string = Maintenance.makeAvailableCommandMarkdownDescription(Maintenance.getDetailedInfo(fileTokens, true));
        let executionMdDesc: string = Maintenance.makeAvailableCommandMarkdownDescription(
            Maintenance.getDetailedExecutionInfo(allExecutionTokens, true)
        );
        const startOfLink:string = " [Read more](https://github.com/guttih/gepper/blob/main/docs/settings.md";
        const readLinkFunc =`${startOfLink}#class-creation---functional-tokens)`;
        const readLinkFile =`${startOfLink}#on-save-command---functional-tokens)`;
        // let executionMdDesc: string = Maintenance.makeAvailableCommandMarkdownDescription(Maintenance.getDetailedInfo(allExecutionTokens, true));

        if (
            !Maintenance.updateJsonPropertyDescription(
                packageJson,
                "cpp.gepper.classHeaderTemplate",
                Maintenance.makeTokenFunctionDescription("### Class Template for header file content (.h)", `${templateFunctionDescription}${readLinkFunc}`)
            )
        ) {
            return false;
        }
        if (
            !Maintenance.updateJsonPropertyDescription(
                packageJson,
                "cpp.gepper.classImplementationTemplate",
                Maintenance.makeTokenFunctionDescription("### Class Template for source file content (.cpp)", `${templateFunctionDescription}${readLinkFunc}`)
            )
        ) {
            return false;
        }
        if (
            !Maintenance.updateJsonPropertyDescription(
                packageJson,
                "cpp.gepper.classHeaderFileNameScheme",
                Maintenance.makeTokenFunctionDescription("### Class header file naming schema (.h)", `${fileFunctionMdDesc}${readLinkFunc}`)
            )
        ) {
            return false;
        }
        if (
            !Maintenance.updateJsonPropertyDescription(
                packageJson,
                "cpp.gepper.classImplementationFileNameScheme",
                Maintenance.makeTokenFunctionDescription("### Class source file naming schema  (.cpp)", `${fileFunctionMdDesc}${readLinkFunc}`)
            )
        ) {
            return false;
        }

        if (
            !Maintenance.updateJsonPropertyDescription(
                packageJson,
                "cpp.gepper.shellExecute.OnSave.Command",
                Maintenance.makeTokenFunctionDescription("### Shell command to execute on save", `${executionMdDesc}${readLinkFile}`)
            )
        ) {
            return false;
        }

        if (
            !Maintenance.updateJsonPropertyDescription(
                packageJson,
                "cpp.gepper.classPath",
                Maintenance.makeTokenFunctionDescription("### Where the class will be created", "relative to the project directory or absolute path.")
            )
        ) {
            return false;
        }

        return true;
    }
    static updateJsonPropertyDescription(packageJson: any, propertyName: string, newDescription: string): Boolean {
        // packageJson.contributes.configuration["0"]?.properties[propertyName]?.description = newDescription;
        if (packageJson.contributes.configuration["0"].properties[propertyName]) {
            packageJson.contributes.configuration["0"].properties[propertyName].markdownDescription = newDescription;
            return true;
        }

        return false;
    }
    static makeTokenFunctionDescription(title: string, trokenFunctionsDescription: string) {
        return `${title}\n${trokenFunctionsDescription}\n`;
    }

    static makeAvailableCommandMarkdownDescription(details: TokenDetails[]): string {
        let maxLength = 0;
        details.forEach((e) => {
            if (e.token.length > maxLength) {
                maxLength = e.token.length;
            }
        });
        let ret: string = "*Available functional tokens are*\n\n";
        ret += Maintenance.makeMarkdownTableRow("Functional token", "Will be replaced with");
        ret += Maintenance.makeMarkdownTableRow(":-----", ":-----");
        details.forEach((e) => (ret += `${e.markdownDescription}`));
        return ret;
    }

    static getTokenDescription(info: FunctionalTokenInfo | ExecutionTokenInfo, formatAsMarkdown: boolean, minTokenWidth?: Number) {
        let desc = "todo: Add description";
        switch (info.value) {
            case FunctionTokenName.className:
                desc = "Entered class name";
                break;
            case FunctionTokenName.classNameUpperCase:
                desc = "Class name transformed to UPPERCASE";
                break;
            case FunctionTokenName.classNameLowerCaseUnder:
                desc = `Class name transformed to lowerCase and every transformed uppercase character is prefixed with "_"`;
                break;
            case FunctionTokenName.classNameLowerCaseDash:
                desc = `Class name transformed to lowerCase and every transformed uppercase character is prefixed with "-"`;
                break;
            case FunctionTokenName.classNameCapitalizeFirst:
                desc = `First letter of entered class name is capitalized`;
                break;
            case FunctionTokenName.classHeaderFileName:
                desc = "default header file name as entered in the settings";
                break;
            case FunctionTokenName.classImplementationFileName:
                desc = "default source file name as entered in the settings";
                break;
            case FunctionTokenName.classNameLowerCase:
                desc = "Class name transformed to lowercase";
                break;
            case ExecutionToken.filePath:
                desc = "Path (with no ending slash) to the file";
                break;
            case ExecutionToken.fileName:
                desc = "File name";
                break;
        }

        return formatAsMarkdown
            ? Maintenance.makeMarkdownTableRow(info.token, desc)
            : Maintenance.joinDescription(info.token, desc, ".", minTokenWidth);
    }
    static makeMarkdownTableRow(column1: string, column2: string) {
        return `| ${ TokenWorker.isToken(column1)? `\`${column1}\`` : column1} | ${column2} |\n`;
    }
    static joinDescription(prefix: string, message: string, postfix: string = "", minTokenWidth?: Number) {
        if (minTokenWidth !== undefined) {
            let diff = Number(minTokenWidth) - prefix.length;
            if (diff > 0) {
                prefix = prefix + new Array(diff + 1).join(" ");
            }
        }
        return `${prefix} - ${message}${postfix}`;
    }

    static getDetailedInfo(infos: FunctionalTokenInfo[], alignDescription: Boolean = false): TokenDetails[] {
        let i = 0;
        let maxLength = 0;
        let arr = infos; //Todo: I need to copy instead of assign?
        if (alignDescription) {
            arr.forEach((e) => {
                if (e.token.length > maxLength) {
                    maxLength = e.token.length;
                }
            });
        }
        arr = arr.map((obj) => ({
            ...obj,
            description: Maintenance.getTokenDescription(obj, false, maxLength),
            markdownDescription: `${Maintenance.getTokenDescription(obj, true)}`,
        }));
        return arr as TokenDetails[];
    }
    static getDetailedExecutionInfo(infos: ExecutionTokenInfo[], alignDescription: Boolean = false): TokenDetails[] {
        let i = 0;
        let maxLength = 0;
        let arr = infos; //Todo: I need to copy instead of assign?
        if (alignDescription) {
            arr.forEach((e) => {
                if (e.token.length > maxLength) {
                    maxLength = e.token.length;
                }
            });
        }
        arr = arr.map((obj) => ({
            ...obj,
            description: Maintenance.getTokenDescription(obj, false, maxLength),
            markdownDescription: `${Maintenance.getTokenDescription(obj, true)}`,
        }));
        return arr as TokenDetails[];
    }
    static getRootDir() {
        //tests are run in ./out folder
        return path.resolve(__dirname, "..");
    }
    static getPackageJsonFullFileName() {
        return path.join(Maintenance.getRootDir(), "package.json");
    }
    static getPackageJson() {
        return require(Maintenance.getPackageJsonFullFileName());
    }
    static getMarkDownDocumentName(filename: string) {
        return path.join(`${Maintenance.getRootDir()}/docs`, filename);
    }
}
