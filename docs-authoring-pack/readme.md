# Docs Authoring Pack

The Docs Authoring Pack provides the following extensions to help author content for docs.microsoft.com:

* [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint), a popular linter by David Anson.
* [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker), a fully offline spell checker by Street Side Software. 
* [Docs Preview](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-preview), which uses the docs.microsoft.com CSS for more accurate Markdown preview, including custom Markdown.
* [Docs Markdown](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-markdown), which provides Markdown authoring assistance, including support for inserting custom Markdown syntax specific to docs.microsoft.com. The rest of this readme provides details on the Docs Markdown extension.
* [Docs Article Templates](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-article-templates), which allows users to apply Markdown skeleton content to new files.
* [Docs YAML](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-yaml), which validates Docs .yml files against the appropriate YAML schemas.
* [Docs Metadata](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-metadata), which speeds up editing of metadata throughout a Docs repository.
* [LinkCheckMD](https://marketplace.visualstudio.com/items?itemName=blackmist.LinkCheckMD) by Larry Franks, which generates a report on the links in the document, including broken links.
* [Docs Images](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-images), which compresses and resizes images.

## Prerequisites and assumptions

To accurately insert relative links, images, and other embedded content with Docs Markdown, you must have your VS Code workspace scoped to the root of your cloned OPS repo. Some syntax supported by the extension, such as alerts and snippets, are custom Markdown for Docs, and will not render correctly unless published via Docs.

## How to use the Docs Markdown extension

To access the Docs Markdown Authoring menu, type `ALT+M`. You can click or use up/down arrows to select the function you want, or type to start filtering, then hit `ENTER` when the function you want is highlighted in the menu.

You can also access the Docs commands from the VS Code command palette by hitting `F1` and typing to filter. All the Docs commands begin with "Docs":

![docs commands](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/image/docs-command-palette.png)

For more information about the Docs Markdown commands, see the [Docs Markdown readme](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-markdown).

## How to use Docs Images extension

To access the Docs Images menu, right click on a folder or individual image file. Select "Compress all images in folder" or "Compress image" from the context menu.

![docs image context menu](images/right-click-image-compression.png)

For more information about the Docs Images extension, see the [Docs Images readme](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-images).

## How to assign keyboard shortcuts

Default keyboard shortcuts are available for some commands, as noted in the table above. You can override them, or add shortcuts for other commands, using the VS Code keyboard shortcut mappings.

1. Type `CTRL+K` then `CTRL+S` to open the Keyboard Shortcuts list.
1. Search for the command, such as `formatBold`, for which you want to create a custom keybinding.
1. Click the plus that appears near the command name when you mouse over the line.
1. After a new input box is visible, type the keyboard shortcut you want to bind to that particular command. For example, to use the common shortcut for bold, type `ctrl+b`.
1. It's a good idea to insert a `when` clause into your keybinding, so it won't be available in files other than Markdown. To do this, open keybindings.json and insert the following line below the command name (be sure to add a comma between lines):
   
    `"when": "editorTextFocus && editorLangId == 'markdown'"`

    Your completed custom keybinding should look like this in keybindings.json:

    ```json
    // Place your key bindings in this file to overwrite the defaults
    [
        {
            "key": "ctrl+b",
            "command": "formatBold",
            "when": "editorTextFocus && editorLangId == 'markdown'"
        }
    ]
    ```

1. Save keybindings.json.

See [Keybindings](https://code.visualstudio.com/docs/getstarted/keybindings) in the VS Code docs for more information.

## How to show the legacy toolbar

Users of the pre-release version of the extension will notice that the authoring toolbar no longer appears at the bottom of the VS Code window when the Docs Markdown extension is installed. This is because the toolbar took up a lot of space on the VS Code status bar, and did not follow best practices for extension UX, so it is deprecated in the new extension. However, you can optionally show the toolbar by updating your VS Code settings.json file as follows:

1. In VS Code, go to File -> Preferences -> Settings (`CTRL+Comma`).
1. Select User Settings to change the settings for all VS Code workspaces, or  Workspace Settings to change them for just the current workspace.
1. In the Default Settings pane on the left, find Docs Markdown Extension Configuration, and select the pencil icon next to the desired setting, and select `true`. VS Code will automatically add the value to the settings.json file and you will be prompted to reload the window for the changes to take effect.
1. Now you will see the toolbar at the bottom of your VS Code window:

   ![toolbar](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/image/legacy-toolbar.png)

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

[MIT](LICENSE)
