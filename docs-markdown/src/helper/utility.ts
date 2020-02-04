"use-strict";

import * as vscode from "vscode";
import * as common from "./common";
import * as log from "./log";

/**
 * Checks the user input for table creation.
 * Format - C:R.
 * Columns and Rows cannot be 0 or negative.
 * 4 Columns maximum.
 * @param {number} size - the number of array size after split user input with ':'
 * @param {string} colStr - the string of requested columns
 * @param {string} rowStr - the string of requested rows
 */
export function validateTableRowAndColumnCount(size: number, colStr: string, rowStr: string) {
    const tableTextRegex = /^-?\d*$/;
    const col = tableTextRegex.test(colStr) ? Number.parseInt(colStr) : undefined;
    const row = tableTextRegex.test(rowStr) ? Number.parseInt(rowStr) : undefined;
    log.debug("Trying to create a table of: " + col + " columns and " + row + " rows.");

    if (col === undefined || row === undefined) {
        return undefined;
    }

    if (size !== 2 || isNaN(col) || isNaN(row)) {
        const errorMsg = "Please input the number of columns and rows as C:R e.g. 3:4";
        common.postWarning(errorMsg);
        return false;
    } else if (col <= 0 || row <= 0) {
        const errorMsg = "The number of rows or columns can't be zero or negative.";
        common.postWarning(errorMsg);
        return false;
    } else if (col > 4) {
        const errorMsg = "You can only insert up to four columns via Docs Markdown.";
        common.postWarning(errorMsg);
        return false;
    } else if (row > 50) {
        const errorMsg = "You can only insert up to 50 rows via Docs Markdown.";
        common.postWarning(errorMsg);
        return false;
    } else {
        return true;
    }
}

/**
 * Creates a string that represents a MarkDown table
 * @param {number} col - the number of columns in the table
 * @param {number} row - the number of rows in the table
 */
export function tableBuilder(col: number, row: number) {
    let str = "\n";

    /// create header
    // DCR update: 893410 [Add leading pipe]
    // tslint:disable-next-line:no-shadowed-variable
    for (let c = 1; c <= col; c++) {
        str += "|" + "Column" + c + "  |";
        // tslint:disable-next-line:no-shadowed-variable
        for (c = 2; c <= col; c++) {
            str += "Column" + c + "  |";
        }
        str += "\n";
    }

    // DCR update: 893410 [Add leading pipe]
    // tslint:disable-next-line:no-shadowed-variable
    for (let c = 1; c <= col; c++) {
        str += "|" + "---------" + "|";
        // tslint:disable-next-line:no-shadowed-variable
        for (c = 2; c <= col; c++) {
            str += "---------" + "|";
        }
        str += "\n";
    }

    /// create each row
    for (let r = 1; r <= row; r++) {
        str += "|" + "Row" + r + "     |";
        for (let c = 2; c <= col; c++) {
            str += "         |";
        }
        str += "\n";
    }

    log.debug("Table created: \r\n" + str);
    return str;
}

/**
 * Finds the files, then lets user pick from match list, if more than 1 match.
 * @param {string} searchTerm - the keyword to search directories for
 * @param {string} fullPath - optional, the folder to start the search under.
 */

export async function search(editor: vscode.TextEditor, selection: vscode.Selection, folderPath: string, fullPath?: string, crossReference?: string) {
    const dir = require("node-dir");
    const path = require("path");
    let language: string = "";
    let selected: vscode.QuickPickItem | undefined;
    let activeFilePath;
    let snippetLink: string = "";
    if (!crossReference) {
        const searchTerm = await vscode.window.showInputBox({ prompt: "Enter snippet search terms." });
        if (!searchTerm) {
            return;
        }
        if (fullPath == null) {
            fullPath = folderPath;
        }

        // searches for all files at the given directory path.
        const files = await dir.promiseFiles(fullPath);
        const fileOptions: vscode.QuickPickItem[] = [];

        for (const file in files) {
            if (files.hasOwnProperty(file)) {
                const baseName: string = (path.parse(files[file]).base);
                const fileName: string = files[file];
                if (fileName.includes(searchTerm)) {
                    fileOptions.push({ label: baseName, description: fileName });
                }
            }
        }

        // select from all files found that match search term.
        selected = await vscode.window.showQuickPick(fileOptions);
        activeFilePath = (path.parse(editor.document.fileName).dir);
        if (!selected) {
            return;
        }
        const target = path.parse(selected.description);
        const relativePath = path.relative(activeFilePath, target.dir);

        language = getLanguage(language, target.ext);

        // change path separator syntax for commonmark
        snippetLink = path.join(relativePath, target.base).replace(/\\/g, "/");
    } else {
        const inputRepoPath = await vscode.window.showInputBox({ prompt: "Enter file path for Cross-Reference GitHub Repo" });
        if (inputRepoPath) {
            language = getLanguage(language, inputRepoPath.split(".").pop());
            snippetLink = `~/${crossReference}/${inputRepoPath}`;
        }
    }
    const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);

    const selectorOptions: vscode.QuickPickItem[] = [];
    selectorOptions.push({ label: "Id", description: "Select code by id tag (for example: <Snippet1>)" });
    selectorOptions.push({ label: "Range", description: "Select code by line range (for example: 1-15,18,20)" });
    selectorOptions.push({ label: "None", description: "Select entire file" });

    vscode.window.showQuickPick(selectorOptions).then((selectorChoice) => {
        if (selectorChoice) {
            let snippet: string;

            switch (selectorChoice.label.toLowerCase()) {
                case "id":
                    vscode.window.showInputBox({ prompt: "Enter id to select" }).then((id) => {
                        if (id) {
                            snippet = snippetBuilder(language, snippetLink, id, undefined);
                            common.insertContentToEditor(editor, search.name, snippet, true, selectionRange);
                        }
                    });
                    break;
                case "range":
                    vscode.window.showInputBox({ prompt: "Enter line selection range" }).then((range) => {
                        if (range) {
                            snippet = snippetBuilder(language, snippetLink, undefined, range);
                            common.insertContentToEditor(editor, search.name, snippet, true, selectionRange);
                        }
                    });
                    break;
                default:
                    snippet = snippetBuilder(language, snippetLink);
                    common.insertContentToEditor(editor, search.name, snippet, true, selectionRange);
                    break;
            }
        }
    });
}

function getLanguage(language: string, ext: string | undefined) {
    if (!ext) {
        return language;
    }
    const dict = [
        { actionscript: [".as"] },
        { arduino: [".ino"] },
        { assembly: ["nasm", ".asm"] },
        { batchfile: [".bat", ".cmd"] },
        { cpp: ["c", "c++", "objective-c", "obj-c", "objc", "objectivec", ".c", ".cpp", ".h", ".hpp", ".cc"] },
        { csharp: ["cs", ".cs"] },
        { cuda: [".cu", ".cuh"] },
        { d: ["dlang", ".d"] },
        { erlang: [".erl"] },
        { fsharp: ["fs", ".fs", ".fsi", ".fsx"] },
        { go: ["golang", ".go"] },
        { haskell: [".hs"] },
        { html: [".html", ".jsp", ".asp", ".aspx", ".ascx"] },
        { cshtml: [".cshtml", "aspx-cs", "aspx-csharp"] },
        { vbhtml: [".vbhtml", "aspx-vb"] },
        { java: [".java"] },
        { javascript: ["js", "node", ".js"] },
        { lisp: [".lisp", ".lsp"] },
        { lua: [".lua"] },
        { matlab: [".matlab"] },
        { pascal: [".pas"] },
        { perl: [".pl"] },
        { php: [".php"] },
        { powershell: ["posh", ".ps1"] },
        { processing: [".pde"] },
        { python: [".py"] },
        { r: [".r"] },
        { ruby: ["ru", ".ru", ".ruby"] },
        { rust: [".rs"] },
        { scala: [".scala"] },
        { shell: ["sh", "bash", ".sh", ".bash"] },
        { smalltalk: [".st"] },
        { sql: [".sql"] },
        { swift: [".swift"] },
        { typescript: ["ts", ".ts"] },
        { xaml: [".xaml"] },
        { xml: ["xsl", "xslt", "xsd", "wsdl", ".xml", ".csdl", ".edmx", ".xsl", ".xslt", ".xsd", ".wsdl"] },
        { vb: ["vbnet", "vbscript", ".vb", ".bas", ".vbs", ".vba"] },
    ];

    for (const key in dict) {
        if (dict.hasOwnProperty(key)) {
            const element: any = dict[key];
            for (const extension in element) {
                if (element.hasOwnProperty(extension)) {
                    const val: string[] = element[extension];
                    for (const x in val) {
                        if (val[x] === ext) {
                            language = extension;
                            break;
                        }
                    }
                }
            }
        }
    }
    if (!language) {
        return ext.substr(1);
    }

    return language;
}

export function internalLinkBuilder(isArt: boolean, pathSelection: string, selectedText: string = "", languageId?: string) {
    const os = require("os");
    let link = "";
    let startBrace = "";
    if (isArt) {
        startBrace = "![";
    } else {
        startBrace = "[";
    }

    // replace the selected text with the properly formatted link
    if (pathSelection === "") {
        link = `${startBrace}${selectedText}]()`;
    } else {
        link = `${startBrace}${selectedText}](${pathSelection})`;
    }

    const langId = languageId || "markdown";
    const isYaml = langId === "yaml" && !isArt;
    if (isYaml) {
        link = pathSelection;
    }

    // The relative path comparison creates an additional level that is not needed and breaks linking.
    // The path module adds an additional level so we'll need to handle this in our code.
    // Update slashes bug 944097.
    if (os.type() === "Windows_NT") {
        link = link.replace(/\\/g, "/");
    }

    if (isArt) {
        // Art links need backslashes to preview and publish correctly.
        link = link.replace(/\\/g, "/");
    }

    return link;
}

export function externalLinkBuilder(link: string, title: string = "") {
    if (title === "") {
        title = link;
    }
    const externalLink = "[" + title + "]" + "(" + link + ")";
    return externalLink;
}

export function videoLinkBuilder(link: string) {
    const videoLink = "> [!VIDEO " + link + "]";
    return videoLink;
}

export function includeBuilder(link: string, title: string) {
    // Include link syntax for reference: [!INCLUDE[sampleinclude](./includes/sampleinclude.md)]
    const include = "[!INCLUDE [" + title + "](" + link + ")]";

    return include;

}

export function snippetBuilder(language: string, relativePath: string, id?: string, range?: string) {
    if (id) {
        return ":::code language=\"" + language + "\" source=\"" + relativePath + "\" id=\"" + id + "\":::"
    } else if (range) {
        return ":::code language=\"" + language + "\" source=\"" + relativePath + "\" range=\"" + range + "\":::"
    } else {
        return ":::code language=\"" + language + "\" source=\"" + relativePath + "\":::";
    }
}

/**
 * Strip out BOM from a string if presented, to prevent exception from JSON.parse function.
 * In Javascript, \uFEFF represents the Byte Order Mark (BOM).
 * @param originalText - the original string of text
 */
export function stripBOMFromString(originalText: string) {
    if (originalText === undefined) {
        return undefined;
    }

    return originalText.replace(/^\uFEFF/, "");
}

/**
 * Create child process.
 */
export function createChildProcess(path: any, args: any, options: any) {
    const spawn = require("child-process-promise").spawn;
    const promise = spawn(path, args, options);
    const childProcess = promise.childProcess;
    return childProcess;
}
