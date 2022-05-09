import * as path from "path";
import { TokenWorker, FunctionTokenName, TokenInfo } from "./tokenWorker";

export interface TokenDetails {
    name: string;
    value: FunctionTokenName;
    token: string;
    description: string;
}

export class Maintenance {
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
        } ));
        return arr as TokenDetails[];
    }
    static getRootDir(){
        //tests are run in ./out folder
        return path.resolve(__dirname, '..');
    }
    static getPackageJson(){
       const dir = Maintenance.getRootDir();
        const fileName = path.join(dir, "package.json");
        return require(fileName);
    }
}
