enum TOKEN {
    PREFIX = "{{",
    PREFIX_VAR = "_",
    POSTFIX_VAR = "_",
    POSTFIX = "}}",
}

export class TokenWorker {
    /**
     * 
     * @param text Content which possibly contains variables to be set 
     * @param variableName Name of the variable  to search for
     * @param value The new value to set instead of the variable token.
     * @returns 
     */
    replaceValues(text: string, variableName: string, value: string):string {
        
        let ret = this.#replaceAllTokens(text, variableName, value);
        return ret;
    }
    #escapeRegExp(text:string) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
    #replaceAll(str:string, find:string, replace:string) {
        return str.replace(new RegExp(this.#escapeRegExp(find), 'g'), replace);
    }
    #replaceAllTokens(str:string, find:string, replace:string) {
        const token = `${TOKEN.PREFIX}${TOKEN.PREFIX_VAR}${find}${TOKEN.POSTFIX_VAR}${TOKEN.POSTFIX}`;
        return str.replace(new RegExp(this.#escapeRegExp(token), 'g'), replace);
    }
}
