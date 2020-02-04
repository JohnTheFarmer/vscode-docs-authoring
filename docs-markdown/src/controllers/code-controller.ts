"use strict";

import { QuickPickOptions, Range, window, Selection, TextEditorEdit } from "vscode";
import { DocsCodeLanguages, languageRequired } from "../constants/docs-code-languages";
import { insertContentToEditor, isMarkdownFileCheck, isValidEditor, noActiveEditorMessage, postWarning, sendTelemetryData, showStatusMessage } from "../helper/common";
import { insertUnselectedText } from "../helper/format-logic-manager";
import { isInlineCode, isMultiLineCode } from "../helper/format-styles";

const telemetryCommand: string = "formatCode";

export function codeFormattingCommand() {
    const commands = [
        { command: formatCode.name, callback: formatCode },
    ];
    return commands;
}

/**
 * Replaces current single or multiline selection with MD code formated selection
 */
export function formatCode() {
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    } else {
        if (!isValidEditor(editor, true, "format code")) {
            return;
        }

        if (!isMarkdownFileCheck(editor, false)) {
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        // Show code language list if the selected text spans multiple lines and is not already formatted as code block.
        // If the selected text is already in a code block, delete the fenced code wrapper.
        // Single line selections will not include a code language.
        if (!selection.isSingleLine) {
            if (!isMultiLineCode(selectedText)) {
                showSupportedLanguages(selectedText, selection);
            } else {
                applyCodeFormatting(selectedText, selection, "");
            }
        } else {
            applyCodeFormatting(selectedText, selection, "");
        }
    }
    sendTelemetryData(telemetryCommand, "");
}

/**
 * Returns input string formatted MD Code or removed markdown code if it already exists.
 * @param {string} content - selected text
 * @param {boolean} isSingleLine - determines is code formatting is inline (isSingleLine = true)
 * @param {vscode.Range} range - If provided will get the text at the given range
 */
export function format(content: string, codeLang: string, isSingleLine: boolean, range: Range) {
    const selectedText = content.trim();

    let styleCode = "";

    // If the selection is contained in a single line treat it as inline code
    // If the selection spans muliple lines apply fenced code formatting
    if (isSingleLine) {
        // Clean up string if it is already formatted
        if (isInlineCode(selectedText)) {
            styleCode = selectedText.substring(1, selectedText.length - 1);
        } else {
            styleCode = "`" + selectedText + "`";
        }
    } else {
        if (isMultiLineCode(selectedText)) {
            // Determine the range if a supported language is part of the starting line.
            const getRange = selectedText.indexOf("\r\n");
            styleCode = "\r\n" + selectedText.substring(getRange, selectedText.length - 3).trim() + "\r\n";
        } else {
            styleCode = "\n```" + codeLang + "\n" + selectedText + "\n```\n";
        }
    }
    // Clean up string if it is already formatted
    return styleCode;
}

/**
 * Returns a list of code languages for users to choose from.  The languages will be displayed in a quick pick menu.
 */

export function showSupportedLanguages(content: string, selectedContent: any) {
    let selectedCodeLang: any;
    const supportedLanguages: any = [];
    const options: QuickPickOptions = { placeHolder: languageRequired };
    DocsCodeLanguages.sort().forEach((codeLang) => {
        supportedLanguages.push(codeLang);
    });
    window.showQuickPick(supportedLanguages, options).then((qpSelection) => {
        if (!qpSelection) {
            postWarning("No code language selected. Abandoning command.");
            return;
        }
        selectedCodeLang = qpSelection;
        applyCodeFormatting(content, selectedContent, selectedCodeLang);
        if (!qpSelection) {
            postWarning("No code language selected. Abandoning command.");
            return;
        }
    });
}

export function applyCodeFormatting(content: string, selectedContent: any, codeLang: string) {
    const selectedText = content.trim();
    const editor = window.activeTextEditor;

    if (!editor) {
        noActiveEditorMessage();
        return;
    } else {
        let selections: Selection[] = editor.selections;
        const emptyRange = new Range(editor.selection.active, editor.selection.active);

        // if unselect text, add bold syntax without any text
        if (selections.length == 0) {
            const cursorPosition = editor.selection.active;
            // assumes the range of code syntax
            const range = new Range(cursorPosition.with(cursorPosition.line, cursorPosition.character - 1
                < 0 ? 0 : cursorPosition.character - 1), cursorPosition.with
                (cursorPosition.line, cursorPosition.character + 1));

            const formattedText = format(selectedText, "", selectedContent.isSingleLine, range);

            insertUnselectedText(editor, formatCode.name, formattedText, range);
        }

        // if only a selection is made with a single cursor
        if (selections.length == 1) {
            // calls formatter and returns selectedText as MD Code
            const formattedText = format(selectedText, codeLang, selectedContent.isSingleLine, emptyRange);

            insertContentToEditor(editor, formatCode.name, formattedText, true);
        }

        // if mulitple cursors were used to make selections
        if (selections.length > 1) {
            editor.edit(function (edit: TextEditorEdit): void {
                selections.forEach((selection: Selection) => {
                    for (let i = selection.start.line; i <= selection.end.line; i++) {
                        let selectedText = editor.document.getText(selection);
                        let formattedText = format(selectedText, codeLang, selectedContent.isSingleLine, emptyRange);
                        edit.replace(selection, formattedText);
                    }
                });
            }).then(success => {
                if (!success) {
                    postWarning("Could not format selections. Abandoning command.");
                    showStatusMessage("Could not format selections. Abandoning command.");
                    return;
                }
            })
        }
    }
}