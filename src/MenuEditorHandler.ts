import { Selection, TextDocument, TextEditor } from "vscode";
import { ClassWorker } from "./Class/ClassWorker";
import { MenuCommon, MenuContext } from "./MenuCommon";

export class MenuEditorHandler {
    handleMenuShow: NodeJS.Timeout | undefined;

    selectVisibleMenuItems(editor: TextEditor | null, document: TextDocument | null, selections: readonly Selection[] | undefined) {
        clearTimeout(this.handleMenuShow);
        this.handleMenuShow = setTimeout(() => {
            this.displayMenuItemAddMissingImplementations(editor, document, selections);
            this.displayAddOperators(editor, document, selections);
        }, 80);
    }
    isInsideClass(editor: TextEditor | null, document: TextDocument | null, selections: readonly Selection[] | undefined): boolean {
        let selection: Selection | undefined = selections && selections.length > 0 ? selections[0] : undefined;
        let shouldShowMenu = false;
        if (editor) {
            document = editor.document;
        }
        if (!document || document.languageId !== "cpp") {
            return false;
        }

        shouldShowMenu = ClassWorker.isInsideClassLine(document, selection);
        if (!shouldShowMenu) {
            //no class selected, let's try to select the first one
            let selection = ClassWorker.selectFirstClassDeclaration(document);
            if (selection) {
                shouldShowMenu = ClassWorker.isInsideClassLine(document, selection);
            }
        }
        return shouldShowMenu;
    }
    displayMenuItemAddMissingImplementations(editor: TextEditor | null, document: TextDocument | null, selections: readonly Selection[] | undefined) {
        if (!this.isInsideClass(editor, document, selections)) {
            MenuCommon.enableMenuItem(MenuContext.showClassImplementMissingFunctions, false);
            return;
        }

        ClassWorker.implementMissingClassFunctions(true, false).then((ret) => {
            MenuCommon.enableMenuItem(
                MenuContext.showClassImplementMissingFunctions,
                ret && ret.notImplemented && ret.notImplemented.length > 0 ? true : false
            );
        });
    }
    displayAddOperators(editor: TextEditor | null, document: TextDocument | null, selections: readonly Selection[] | undefined) {
        let show = this.isInsideClass(editor, document, selections);
        MenuCommon.enableMenuItem(MenuContext.showClassAddOperators, show);
        //todo: detect if all operators have been implemented, and if so do not show this menuItem
    }
}
