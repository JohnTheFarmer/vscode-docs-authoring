import {
    CancellationToken,
    CodeAction,
    CodeActionContext,
    CodeActionKind,
    CodeActionProvider,
    CompletionContext,
    CompletionItem,
    CompletionItemKind,
    CompletionItemProvider,
    Diagnostic,
    DiagnosticSeverity,
    MarkdownString,
    Position,
    QuickPickItem,
    Range,
    TextDocument,
    window,
    workspace,
} from "vscode";

import { insertContentToEditor, matchAll, noActiveEditorMessage } from "./common";

export function insertLanguageCommands() {
    return [
        { command: insertLanguageIdentifier.name, callback: insertLanguageIdentifier },
    ];
}

interface IHighlightLanguage {
    readonly language: string;
    readonly aliases: string[];
    readonly isPopular?: boolean | undefined;
}

type HighlightLanguages = IHighlightLanguage[];

/**
 * The various syntax highlighting languages available.
 * Source langs: https://raw.githubusercontent.com/DuncanmaMSFT/highlight.js/master/README.md
 */
const languages: HighlightLanguages =
    [
        { language: "1C", aliases: ["1c"] },
        { language: "ABNF", aliases: ["abnf"] },
        { language: "Access logs ", aliases: ["accesslog"] },
        { language: "Ada ", aliases: ["ada"] },
        { language: "ARM assembler ", aliases: ["armasm", "arm"] },
        { language: "AVR assembler ", aliases: ["avrasm"] },
        { language: "ActionScript", aliases: ["actionscript", "as"] },
        { language: "Alan", aliases: ["alan", "i"] },
        { language: "AngelScript ", aliases: ["angelscript", "asc"] },
        { language: "Apache", aliases: ["apache", "apacheconf"] },
        { language: "AppleScript ", aliases: ["applescript", "osascript"] },
        { language: "Arcade", aliases: ["arcade"] },
        { language: "AsciiDoc", aliases: ["asciidoc", "adoc"] },
        { language: "AspectJ ", aliases: ["aspectj"] },
        { language: "AutoHotkey", aliases: ["autohotkey"] },
        { language: "AutoIt", aliases: ["autoit"] },
        { language: "Awk ", aliases: ["awk", "mawk", "nawk", "gawk"] },
        { language: "Axapta", aliases: ["axapta"] },
        { language: "Azure CLI", aliases: ["azurecli"], isPopular: true },
        { language: "Azure CLI (Interactive)", aliases: ["azurecli-interactive"], isPopular: true },
        { language: "Azure Powershell (Interactive)", aliases: ["azurepowershell-interactive"], isPopular: true },
        { language: "Bash", aliases: ["bash", "sh", "zsh"], isPopular: true },
        { language: "Basic ", aliases: ["basic"] },
        { language: "BNF ", aliases: ["bnf"] },
        { language: "Brainfuck ", aliases: ["brainfuck", "bf"] },
        { language: "C#", aliases: ["csharp", "cs"], isPopular: true },
        { language: "C# (Interactive)", aliases: ["csharp-interactive"], isPopular: true },
        { language: "C++ ", aliases: ["cpp", "c", "cc", "h", "c++", "h++", "hpp"], isPopular: true },
        { language: "C/AL", aliases: ["cal"] },
        { language: "Cache Object Script ", aliases: ["cos", "cls"] },
        { language: "CMake ", aliases: ["cmake", "cmake.in"] },
        { language: "Coq ", aliases: ["coq"] },
        { language: "CSP ", aliases: ["csp"] },
        { language: "CSS ", aliases: ["css"] },
        { language: "Cap’n Proto ", aliases: ["capnproto", "capnp"] },
        { language: "Clojure ", aliases: ["clojure", "clj"] },
        { language: "CoffeeScript", aliases: ["coffeescript", "coffee", "cson", "iced"] },
        { language: "Crmsh ", aliases: ["crmsh", "crm", "pcmk"] },
        { language: "Crystal ", aliases: ["crystal", "cr"] },
        { language: "Cypher (Neo4j)", aliases: ["cypher"] },
        { language: "D ", aliases: ["d"] },
        { language: "DNS Zone file ", aliases: ["dns", "zone", "bind"] },
        { language: "DOS ", aliases: ["dos", "bat", "cmd"], isPopular: true },
        { language: "Dart", aliases: ["dart"] },
        { language: "Delphi", aliases: ["delphi", "dpr", "dfm", "pas", "pascal", "freepascal", "lazarus", "lpr", "lfm"] },
        { language: "Diff", aliases: ["diff", "patch"] },
        { language: "Django", aliases: ["django", "jinja"] },
        { language: "Dockerfile", aliases: ["dockerfile", "docker"], isPopular: true },
        { language: "dsconfig", aliases: ["dsconfig"] },
        { language: "DTS (Device Tree) ", aliases: ["dts"] },
        { language: "Dust", aliases: ["dust", "dst"] },
        { language: "Dylan ", aliases: ["dylan"] },
        { language: "EBNF", aliases: ["ebnf"] },
        { language: "Elixir", aliases: ["elixir"] },
        { language: "Elm ", aliases: ["elm"] },
        { language: "Erlang", aliases: ["erlang", "erl"] },
        { language: "Excel ", aliases: ["excel", "xls", "xlsx"] },
        { language: "Extempore ", aliases: ["extempore", "xtlang", "xtm"] },
        { language: "F#", aliases: ["fsharp", "fs"], isPopular: true },
        { language: "FIX ", aliases: ["fix"] },
        { language: "Fortran ", aliases: ["fortran", "f90", "f95"] },
        { language: "G-Code", aliases: ["gcode", "nc"] },
        { language: "Gams", aliases: ["gams", "gms"] },
        { language: "GAUSS ", aliases: ["gauss", "gss"] },
        { language: "GDScript", aliases: ["godot", "gdscript"] },
        { language: "Gherkin ", aliases: ["gherkin"] },
        { language: "GN for Ninja", aliases: ["gn", "gni"] },
        { language: "Go", aliases: ["go", "golang"], isPopular: true },
        { language: "Golo", aliases: ["golo", "gololang"] },
        { language: "Gradle", aliases: ["gradle"] },
        { language: "Groovy", aliases: ["groovy"] },
        { language: "HTML", aliases: ["html", "xhtml"], isPopular: true },
        { language: "HTTP", aliases: ["http", "https"], isPopular: true },
        { language: "Haml", aliases: ["haml"] },
        { language: "Handlebars", aliases: ["handlebars", "hbs", "html.hbs", "html.handlebars"] },
        { language: "Haskell ", aliases: ["haskell", "hs"] },
        { language: "Haxe", aliases: ["haxe", "hx"] },
        { language: "Hy", aliases: ["hy", "hylang"] },
        { language: "Ini", aliases: ["ini"], isPopular: true },
        { language: "Inform7 ", aliases: ["inform7", "i7"] },
        { language: "IRPF90", aliases: ["irpf90"] },
        { language: "JSON", aliases: ["json"], isPopular: true },
        { language: "Java", aliases: ["java", "jsp"], isPopular: true },
        { language: "JavaScript", aliases: ["javascript", "js", "jsx"], isPopular: true },
        { language: "Kotlin", aliases: ["kotlin", "kt"], isPopular: true },
        { language: "Leaf", aliases: ["leaf"] },
        { language: "Lasso ", aliases: ["lasso", "ls", "lassoscript"] },
        { language: "Less", aliases: ["less"], isPopular: true },
        { language: "LDIF", aliases: ["ldif"] },
        { language: "Lisp", aliases: ["lisp"] },
        { language: "LiveCode Server ", aliases: ["livecodeserver"] },
        { language: "LiveScript", aliases: ["livescript", "ls"] },
        { language: "Lua ", aliases: ["lua"] },
        { language: "Makefile", aliases: ["makefile", "mk", "mak"], isPopular: true },
        { language: "Markdown", aliases: ["markdown", "md", "mkdown", "mkd"], isPopular: true },
        { language: "Mathematica ", aliases: ["mathematica", "mma", "wl"] },
        { language: "Matlab", aliases: ["matlab"] },
        { language: "Maxima", aliases: ["maxima"] },
        { language: "Maya Embedded Language", aliases: ["mel"] },
        { language: "Mercury ", aliases: ["mercury"] },
        { language: "mIRC Scripting Language ", aliases: ["mirc", "mrc"] },
        { language: "Mizar ", aliases: ["mizar"] },
        { language: "Mojolicious ", aliases: ["mojolicious"] },
        { language: "Monkey", aliases: ["monkey"] },
        { language: "Moonscript", aliases: ["moonscript", "moon"] },
        { language: "MS Graph (Interactive)", aliases: ["msgraph-interactive"], isPopular: true },
        { language: "N1QL", aliases: ["n1ql"] },
        { language: "NSIS", aliases: ["nsis"] },
        { language: "Nginx ", aliases: ["nginx", "nginxconf"], isPopular: true },
        { language: "Nimrod", aliases: ["nimrod", "nim"] },
        { language: "Nix ", aliases: ["nix"] },
        { language: "OCaml ", aliases: ["ocaml", "ml"] },
        { language: "Objective C ", aliases: ["objectivec", "mm", "objc", "obj-c"], isPopular: true },
        { language: "OpenGL Shading Language ", aliases: ["glsl"] },
        { language: "OpenSCAD", aliases: ["openscad", "scad"] },
        { language: "Oracle Rules Language ", aliases: ["ruleslanguage"] },
        { language: "Oxygene ", aliases: ["oxygene"] },
        { language: "PF", aliases: ["pf", "pf.conf"] },
        { language: "PHP ", aliases: ["php", "php3", "php4", "php5", "php6"], isPopular: true },
        { language: "Parser3 ", aliases: ["parser3"] },
        { language: "Perl", aliases: ["perl", "pl", "pm"] },
        { language: "Plaintext: no highlight ", aliases: ["plaintext"], isPopular: true },
        { language: "Pony", aliases: ["pony"] },
        { language: "PostgreSQL & PL/pgSQL ", aliases: ["pgsql", "postgres", "postgresql"] },
        { language: "PowerShell", aliases: ["powershell", "ps"], isPopular: true },
        { language: "PowerShell (Interactive)", aliases: ["powershell-interactive"], isPopular: true },
        { language: "Processing", aliases: ["processing"] },
        { language: "Prolog", aliases: ["prolog"] },
        { language: "Properties", aliases: ["properties"] },
        { language: "Protocol Buffers", aliases: ["protobuf"], isPopular: true },
        { language: "Puppet", aliases: ["puppet", "pp"] },
        { language: "Python", aliases: ["python", "py", "gyp"], isPopular: true },
        { language: "Python profiler results ", aliases: ["profile"] },
        { language: "Q ", aliases: ["k", "kdb"], isPopular: true },
        { language: "QML ", aliases: ["qml"] },
        { language: "R ", aliases: ["r"], isPopular: true },
        { language: "Razor CSHTML", aliases: ["cshtml", "razor", "razor-cshtml"], isPopular: true },
        { language: "ReasonML", aliases: ["reasonml", "re"] },
        { language: "RenderMan RIB ", aliases: ["rib"] },
        { language: "RenderMan RSL ", aliases: ["rsl"] },
        { language: "Roboconf", aliases: ["graph", "instances"] },
        { language: "Robot Framework ", aliases: ["robot", "rf"] },
        { language: "RPM spec files", aliases: ["rpm-specfile", "rpm", "spec", "rpm-spec", "specfile"] },
        { language: "Ruby", aliases: ["ruby", "rb", "gemspec", "podspec", "thor", "irb"], isPopular: true },
        { language: "Rust", aliases: ["rust", "rs"], isPopular: true },
        { language: "SAS ", aliases: ["SAS", "sas"], isPopular: true },
        { language: "SCSS", aliases: ["scss"], isPopular: true },
        { language: "SQL ", aliases: ["sql"], isPopular: true },
        { language: "STEP Part 21", aliases: ["p21", "step", "stp"] },
        { language: "Scala ", aliases: ["scala"], isPopular: true },
        { language: "Scheme", aliases: ["scheme"] },
        { language: "Scilab", aliases: ["scilab", "sci"] },
        { language: "Shape Expressions ", aliases: ["shexc"] },
        { language: "Shell ", aliases: ["shell", "console"], isPopular: true },
        { language: "Smali ", aliases: ["smali"] },
        { language: "Smalltalk ", aliases: ["smalltalk", "st"] },
        { language: "Solidity", aliases: ["solidity", "sol"] },
        { language: "Stan", aliases: ["stan"] },
        { language: "Stata ", aliases: ["stata"] },
        { language: "Structured Text ", aliases: ["iecst", "scl", "stl", "structured-text"], isPopular: true },
        { language: "Stylus", aliases: ["stylus", "styl"] },
        { language: "SubUnit ", aliases: ["subunit"] },
        { language: "Supercollider ", aliases: ["supercollider", "sc"] },
        { language: "Swift ", aliases: ["swift"], isPopular: true },
        { language: "Tcl ", aliases: ["tcl", "tk"] },
        { language: "Terraform (HCL) ", aliases: ["terraform", "tf", "hcl"] },
        { language: "Test Anything Protocol", aliases: ["tap"] },
        { language: "TeX ", aliases: ["tex"] },
        { language: "Thrift", aliases: ["thrift"] },
        { language: "TOML", aliases: ["toml"] },
        { language: "TP", aliases: ["tp"] },
        { language: "Twig", aliases: ["twig", "craftcms"] },
        { language: "TypeScript", aliases: ["typescript", "ts"], isPopular: true },
        { language: "VB.Net", aliases: ["vbnet", "vb"], isPopular: true },
        { language: "VBScript", aliases: ["vbscript", "vbs"] },
        { language: "VHDL", aliases: ["vhdl"] },
        { language: "Vala", aliases: ["vala"] },
        { language: "Verilog ", aliases: ["verilog", "v"] },
        { language: "Vim Script", aliases: ["vim"], isPopular: true },
        { language: "x86 Assembly", aliases: ["x86asm"], isPopular: true },
        { language: "XL", aliases: ["xl", "tao"] },
        { language: "XQuery", aliases: ["xquery", "xpath", "xq"] },
        { language: "YAML", aliases: ["yml", "yaml"], isPopular: true },
        { language: "XML", aliases: ["xml", "xhtml", "rss", "atom", "xjb", "xsd", "xsl", "plist"], isPopular: true },
        { language: "Zephir", aliases: ["zephir", "zep"] },
    ];

const groupings: Map<boolean, HighlightLanguages> = new Map();
groupings.set(true, languages.filter((lang) => !!lang.isPopular));
groupings.set(false, languages.filter((lang) => !lang.isPopular));

/**
 * The various syntax highlighting languages available, grouped by popularity.
 */
const languagesGroupedByPopularity: Map<boolean, HighlightLanguages> = groupings;

/**
 * All of the possible aliases concatenated together.
 */
const allAliases: string[] =
    languages.reduce((aliases, lang) => aliases.concat(lang.aliases), [""]);

/**
 * Validates whether or not a given language is going to render correctly with syntax highlighting.
 */
function isValidCodeLang(language: string) {
    return allAliases.some((alias) => alias === language.toLowerCase());
}

export async function insertLanguageIdentifier(range: Range) {
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    const selection = range || editor.selection;
    if (selection) {
        const items = getLanguageIdentifierQuickPickItems();
        const item = await window.showQuickPick(items);
        if (item) {
            const language = languages.find((lang) => lang.language === item.label);
            if (language) {
                const alias = language.aliases[0];
                insertContentToEditor(editor, "insertLanguageIdentifier", alias, true, selection);
            }
        }
    } else {
        window.showWarningMessage("Please first make a selection to insert a language identifier.");
    }
}

function getLanguageIdentifierQuickPickItems() {
    const items: QuickPickItem[] = [];
    const langs = getConfiguredLanguages();
    if (langs) {
        langs.forEach((lang) => {
            const item: QuickPickItem = {
                description: `Use the "${lang.language.trim()}" language identifer (alias: ${lang.aliases[0]}).`,
                label: lang.language,
            };
            items.push(item);
        });
    }

    return items;
}

function getLanguageIdentifierCompletionItems(range: Range | undefined, isCancellationRequested: boolean) {
    if (range) {
        const completionItems: CompletionItem[] = [];
        const langs = getConfiguredLanguages();
        if (langs) {
            langs.forEach((lang) => {
                const item = new CompletionItem(lang.language, CompletionItemKind.Value);
                const langId = item.sortText = item.insertText = lang.aliases[0];
                const doc = new MarkdownString(`Use the "${lang.language.trim()}" language identifer (alias: ${item.insertText}).`);
                doc.appendText("\r\nSample:\r\n");
                doc.appendCodeblock(`\`\`\`${langId}`, "markdown");
                doc.appendCodeblock("// some code...", "markdown");
                doc.appendCodeblock("\r\n", "markdown");
                doc.appendCodeblock("\`\`\` ", "markdown"); // This is missing from the completion item!
                doc.appendText("");
                item.documentation = doc;
                completionItems.push(item);
            });
        }

        return isCancellationRequested
            ? undefined
            : completionItems;
    }

    return undefined;
}

function getConfiguredLanguages() {
    return workspace.getConfiguration("markdown").allAvailableLanguages
        ? languages
        : languagesGroupedByPopularity.get(true);
}

export const markdownCompletionItemsProvider: CompletionItemProvider = {
    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext) {
        const range = document.getWordRangeAtPosition(position, /```/);
        if (range) {
            const text = document.getText();
            if (text) {
                const TRIPLE_BACKTICK_RE = /```/gm;
                const results = matchAll(TRIPLE_BACKTICK_RE, text);
                if (results) {
                    for (let i = 0; i < results.length; ++i) {
                        if (i % 2 === 0) {
                            const match = results[i];
                            if (match) {
                                const index = match.index || -1;
                                const pos = document.positionAt(index);
                                const positionIsInRange =
                                    pos.line === range.start.line && pos.character >= range.start.character ||
                                    pos.line === range.end.line && pos.character <= range.end.character;
                                if (index >= 0 && positionIsInRange) {
                                    return getLanguageIdentifierCompletionItems(range, token.isCancellationRequested);
                                }
                            }
                        }
                    }
                }
            }
        }

        return undefined;
    },
};

export const markdownCodeActionProvider: CodeActionProvider = {
    provideCodeActions(document: TextDocument, _: Range, context: CodeActionContext, token: CancellationToken) {
        const CODE_FENCE_RE = /`{3,4}(.*?[^```])$/gm;
        const text = document.getText();
        const results: CodeAction[] = [];
        for (const matches of matchAll(CODE_FENCE_RE, text).filter((ms) => !!ms)) {
            if (matches) {
                const lang = matches[1] || undefined;
                if (!!lang && lang !== "\r" && lang !== "\n") {
                    const index = matches.index || -1;
                    if (lang && index >= 0) {
                        if (!isValidCodeLang(lang)) {
                            const action =
                                new CodeAction(
                                    `Click to fix "${lang}" unrecognized code-fence language identifer`,
                                    CodeActionKind.QuickFix);

                            const indexWithOffset = index + 3; // Account for "```".
                            const startPosition = document.positionAt(indexWithOffset);
                            const endPosition = document.positionAt(indexWithOffset + lang.length);
                            const range = new Range(startPosition, endPosition);
                            const diagnostics =
                                new Diagnostic(
                                    range,
                                    "Select from available code-fence language identifiers",
                                    DiagnosticSeverity.Warning);
                            (action.diagnostics || (action.diagnostics = [])).push(diagnostics);

                            action.command = {
                                arguments: [range],
                                command: "insertLanguageIdentifier",
                                title: "Insert language identifier",
                                tooltip: "Select from the available language identifiers.",
                            };

                            results.push(action);
                        }
                    }
                }
            }
        }

        return token.isCancellationRequested
            ? undefined
            : results;
    },
};
