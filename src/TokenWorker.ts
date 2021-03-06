enum TOKEN {
    prefix = "{{",
    prefixVar = "__",
    postfixVar = "__",
    postfix = "}}",
}

export interface FunctionalTokenInfo {
    name: string;
    value: FunctionTokenName;
    token: string;
}
export interface ExecutionTokenInfo {
    name: string;
    value: ExecutionToken;
    token: string;
}
export enum FunctionTokenName {
    className = "CLASS_NAME",
    classNameUpperCase = "CLASS_NAME_UPPER",
    classNameLowerCase = "CLASS_NAME_LOWER",
    classNameLowerCaseDash = "CLASS_NAME_LOWER_DASH",
    classNameLowerCaseUnder = "CLASS_NAME_LOWER_UNDER",
    classNameCapitalizeFirst = "CLASS_NAME_CAPITALIZE",
    classHeaderFileName = "HEADER_FILE_NAME",
    classImplementationFileName = "SOURCE_FILE_NAME",
}

export enum ExecutionToken {
    filePath = "FILE_PATH",
    fileName = "FILE_NAME",
}

export class TokenWorker {
    /**
     * Convert text to lower case.
     * @param text Text to to set to lower case.
     * @param capPrefix optional to set as prefix when lowering character not at the beginning of text.
     */
    /** */
    static toLower(text: string, capPrefix?: string): string {
        let ret: string = text[0].toLowerCase();
        let lower: string;
        for (let i = 1; i < text.length; i++) {
            lower = text[i].toLowerCase();
            ret += capPrefix && text[i] !== lower ? `${capPrefix}${lower}` : lower;
        }
        return ret;
    }

    static isToken(text: string):Boolean {
        //todo: lookup string values in all tokens
        return text.startsWith(`${TOKEN.prefix}${TOKEN.prefixVar}`) && text.endsWith(`${TOKEN.postfixVar}${TOKEN.postfix}`);
    }
    static hasToken(text: string):Boolean {
        //todo: lookup string values in all tokens
        const iSearch = text.indexOf(`${TOKEN.postfix}${TOKEN.prefixVar}`);
        return  iSearch > -1 && text.indexOf(`${TOKEN.postfixVar}${TOKEN.postfix}`) > iSearch;
    }
    static capitalizeFirst(text: string): string {
        return `${text[0].toUpperCase()}${text.substring(1)}`;
    }
    static toUpper(text: string): string {
        return text.toUpperCase();
    }
    /**
     * Creates a valid token usable in templates.
     * The function wraps prefix and postfix strings around the given function token.
     * @param name name of function token to create a token from
     * @returns A valid token
     */
    static createToken(name: FunctionTokenName | ExecutionToken): string {
        return `${TOKEN.prefix}${TOKEN.prefixVar}${name}${TOKEN.postfixVar}${TOKEN.postfix}`;
    }

    /**
     * Get all available token strings in a template
     * @returns All available function tokens
     */
    static getAllCreatedToken(): Array<string> {
        const ret: Array<string> = [];
        Object.values(FunctionTokenName).forEach((name) => {
            ret.push(TokenWorker.createToken(name));
        });
        return ret;
    }

    static getFunctionalTokenInfo(name: FunctionTokenName): FunctionalTokenInfo {
        let info: FunctionalTokenInfo = {
            name: name,
            value: name as FunctionTokenName,
            token: TokenWorker.createToken(name),
        };
        return info;
    }
    static getExecutionTokenInfo(name: ExecutionToken): ExecutionTokenInfo {
        let info: ExecutionTokenInfo = {
            name: name,
            value: name as ExecutionToken,
            token: TokenWorker.createToken(name),
        };
        return info;
    }
    static getFunctionalTokens(): Array<FunctionalTokenInfo> {
        // const tokenList = TokenWorker.getAllCreatedToken();
        const tokenFunctions: Array<FunctionalTokenInfo> = Object.keys(FunctionTokenName).map((name) => {
            return TokenWorker.getFunctionalTokenInfo((<any>FunctionTokenName)[name]);
            // return {
            //     name,
            //     value: FunctionTokenName[name as keyof typeof FunctionTokenName],
            //     token: TokenWorker.createToken(
            //         FunctionTokenName[name as keyof typeof FunctionTokenName]
            //     ),
            // } as TokenInfo;
        });
        return tokenFunctions;

        // Object.tokenFunctions.forEach(key => {
        //     content = TokenWorker.executeTokenFunction(key, content);
        // });
    }
    static getExecutionTokens(): Array<ExecutionTokenInfo> {
        const executionTokens: Array<ExecutionTokenInfo> = Object.keys(ExecutionToken).map((name) => {
            return TokenWorker.getExecutionTokenInfo((<any>ExecutionToken)[name]);
        });
        return executionTokens;

    }

    /**
     *
     * @param text Content which possibly contains variables to be set
     * @param variableName Name of the variable  to search for
     * @param value The new value to set instead of the variable token.
     * @returns
     */
    static replaceValues(text: string, variableName: string, value: string): string {
        let ret = TokenWorker.replaceAll(text, variableName, value);
        return ret;
    }
    static isOnlySpaces(str?: string) {
        if (!str) {
            return true;
        }
        return /^\s*$/.test(str);
    }
    static escapeRegExp(text: string) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }
    static replaceAll(str: string, find: string, replace: string) {
        return str.replace(new RegExp(this.escapeRegExp(find), "g"), replace);
    }
}
