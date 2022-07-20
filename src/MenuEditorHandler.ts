import { Selection, TextDocument, TextEditor } from "vscode";
import { ClassWorker } from "./ClassWorker";
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
    displayMenuItemAddMissingImplementations(
        editor: TextEditor | null,
        document: TextDocument | null,
        selections: readonly Selection[] | undefined
    ) {
        let selection: Selection | undefined = selections && selections.length > 0 ? selections[0] : undefined;
        let shouldShowMenu = false;
        if (editor) {
            document = editor.document;
        }
        if (!document || document.languageId !== "cpp") {
            MenuCommon.enableMenuItem(MenuContext.showClassImplementMissingFunctions, false);
            return;
        }

        shouldShowMenu = ClassWorker.isInsideClassLine(document, selection);
        if (!shouldShowMenu) {
            //no class selected, let's try to select the first one
            let selection = ClassWorker.selectFirstClassDeclaration(document);
            if (selection) {
                shouldShowMenu = ClassWorker.isInsideClassLine(document, selection);
            }
            if (shouldShowMenu) {
                ClassWorker.implementMissingClassFunctions(true, false).then((funcArr) => {
                    MenuCommon.enableMenuItem(MenuContext.showClassImplementMissingFunctions, funcArr && funcArr.length > 0 ? true : false);
                });
            } else {
                MenuCommon.enableMenuItem(MenuContext.showClassImplementMissingFunctions, false);
            }
        }
    }
    displayAddOperators(
        editor: TextEditor | null,
        document: TextDocument | null,
        selections: readonly Selection[] | undefined
    ) {
        MenuCommon.enableMenuItem(MenuContext.showClassAddOperators, false);

    }
}
