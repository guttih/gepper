enum TOKEN {
    prefix = "{{",
    prefixVar = "__",
    postfixVar = "__",
    postfix = "}}",
}

export class TokenWorker {
    /**
     *
     * @param text Content which possibly contains variables to be set
     * @param variableName Name of the variable  to search for
     * @param value The new value to set instead of the variable token.
     * @returns
     */
    replaceValues(text: string, variableName: string, value: string): string {
        let ret = this.#replaceAllTokens(text, variableName, value);
        return ret;
    }
    isOnlySpaces(str?: string) {
        if (!str) {
            return true;
        }
        return /^\s*$/.test(str);
    }
    #escapeRegExp(text: string) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }
    #replaceAll(str: string, find: string, replace: string) {
        return str.replace(new RegExp(this.#escapeRegExp(find), "g"), replace);
    }
    #replaceAllTokens(str: string, find: string, replace: string) {
        const token = `${TOKEN.prefix}${TOKEN.prefixVar}${find}${TOKEN.postfixVar}${TOKEN.postfix}`;
        return str.replace(new RegExp(this.#escapeRegExp(token), "g"), replace);
    }
}
