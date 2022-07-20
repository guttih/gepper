import { commands } from "vscode";

export enum MenuContext {
    showClassImplementMissingFunctions = "gepper.showClassImplementMissingFunctions",
    showClassAddOperators = "gepper.showClassAddOperators"
}

export class MenuCommon {
    static enableMenuItem(menuItemToEnable:MenuContext, enable:boolean) {
        commands.executeCommand("setContext", menuItemToEnable, enable);
    }
}