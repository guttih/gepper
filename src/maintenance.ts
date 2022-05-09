import * as path from "path";
import * as fs from "fs";
import { TokenWorker, FunctionTokenName, TokenInfo } from "./tokenWorker";

export interface TokenDetails {
    name: string;
    value: FunctionTokenName;
    token: string;
    description: string;
}

export class Maintenance {
    static savePackageJsonToDisk(packageJson: any) {
        let newContent = JSON.stringify(packageJson, null, 4);
        let fileName = Maintenance.getPackageJsonFullFileName(); /*  */
        try {
            fs.writeFileSync(fileName, newContent);
        } catch (err) {
            console.error(err);
            console.log("Unable to write to file package.json");
            return null;
        }
    }
    static updateAllTokenPropertyDescriptions(packageJson: any): Boolean {
        let allTokens = TokenWorker.getFunctionalTokens();
        let fileTokens = allTokens.filter(
            (e) => e.value !== FunctionTokenName.classHeaderFileName && e.value !== FunctionTokenName.classImplementationFileName
        );

        let templateFunctionDescription: string = Maintenance.makeAvailableCommandDescription(Maintenance.getDetailedInfo(allTokens, true));
        let fileFunctionDescription: string = Maintenance.makeAvailableCommandDescription(Maintenance.getDetailedInfo(fileTokens, true));

        if (
            !Maintenance.updateJsonPropertyDescription(
                packageJson,
                "cpp.gepper.classHeaderTemplate",
                Maintenance.makeTokenFunctionDescription("Content of your created header file. ", templateFunctionDescription)
            )
        ) {
            return false;
        }
        if (
            !Maintenance.updateJsonPropertyDescription(
                packageJson,
                "cpp.gepper.classImplementationTemplate",
                Maintenance.makeTokenFunctionDescription("Content of your created source file. ", templateFunctionDescription)
            )
        ) {
            return false;
        }
        if (
            !Maintenance.updateJsonPropertyDescription(
                packageJson,
                "cpp.gepper.classHeaderFileNameScheme",
                Maintenance.makeTokenFunctionDescription("Name of your header file. ", fileFunctionDescription)
            )
        ) {
            return false;
        }
        if (
            !Maintenance.updateJsonPropertyDescription(
                packageJson,
                "cpp.gepper.classImplementationFileNameScheme",
                Maintenance.makeTokenFunctionDescription("Name of your source file. ", fileFunctionDescription)
            )
        ) {
            return false;
        }

        return true;

        // console.log("---   fileFunctionDescription   ----");
        // console.log(fileFunctionDescription);
        // console.log("------------------------------------");
        // console.log("-------- templateFunctions ---------");
        // console.log(templateFunctionDescription);
        // console.log("------------------------------------");
        // console.log(JSON.stringify(packageJson, null, 4));

        // Maintenance.makeTokenFunctionDescription("Content of your created header file. ", templateFunctionDescription);
        // Maintenance.makeTokenFunctionDescription("Content of your created source file", templateFunctionDescription);
        // Maintenance.makeTokenFunctionDescription("Name of your header file", fileFunctionDescription);
        // Maintenance.makeTokenFunctionDescription("Name of your source file", fileFunctionDescription);
    }
    static updateJsonPropertyDescription(packageJson: any, propertyName: string, newDescription: string): Boolean {
        // if (packageJson?.contributes?.configuration?.length > 0 && packageJson.contributes.configuration["0"].title === packageJson.displayName) {
        if (packageJson?.contributes?.configuration["0"]?.properties[propertyName]?.description) {
            packageJson.contributes.configuration["0"].properties[propertyName].description = newDescription;
            return true;
        }

        return false;
    }
    static makeTokenFunctionDescription(title: string, trokenFunctionsDescription: string) {
        return `${title}\n${trokenFunctionsDescription}\n`;
    }

    static makeAvailableCommandDescription(details: TokenDetails[]): string {
        let maxLength = 0;
        details.forEach((e) => {
            if (e.token.length > maxLength) {
                maxLength = e.token.length;
            }
        });
        let ret: string = "Available commands are:";
        details.forEach((e) => (ret += `\n${e.description}`));
        return ret;
    }
    constructor() {}

    static getTokenDescription(info: TokenInfo, minTokenWidth?: Number) {
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
        }
        return Maintenance.joinDescription(info.token, desc, ".", minTokenWidth);
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

    static getDetailedInfo(infos: TokenInfo[], alignDescription: Boolean = false): TokenDetails[] {
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
            description: Maintenance.getTokenDescription(obj, maxLength),
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
}
