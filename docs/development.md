# Development for Gepper

Some useful things for the developer of this project

## Help

Documentation to look at when developing extensions

- **Development** [Development](https://code.visualstudio.com/api/get-started/your-first-extension)
- **Snippets** [Snippet Guide](https://code.visualstudio.com/api/language-extensions/snippet-guide)
- **VS Code API** This [page](https://code.visualstudio.com/api/references/vscode-api) is comiled from this [file](https://github.com/microsoft/vscode/blob/main/src/vscode-dts/vscode.d.ts).

## Development

### Converting code to extension

- [Snippet Guide](https://code.visualstudio.com/api/language-extensions/snippet-guide)
- [Variables](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_variables)
- [Language Configuration Guide](https://code.visualstudio.com/api/language-extensions/language-configuration-guide)
- [Snippet generator](https://snippet-generator.app/) Converting code to snippet

### Adding a new snippet file to your extension

  1. Create the json file in [snippets](snippets) directory
  2. Add reference to the file in [package.json](package.json) under contributes.snippets

### Testing your extension

  1. Open the file [index.ts](src/extension.ts) in vscode
  2. Press **F5** to run the extension
  3. Test your extension

## Deployment

### Creating the package

Before publishing make sure all test run correctly by running the command

```shell
npm run test

```

In this example we use 1.0.0 as the example version number, you will need to bump it every time you release.

1. cd into the root dir of this repo
2. Export snippet list to markdown
   - by running

    ```shell
    npm run prepare
    ```

    - or if you want to want to increase the version number by one, run with parameter *-bump* like so

    ```shell
    npm run bump
    ```

    which will increment three version numbers, one in file [package.json] and two [package-lock.json].

3. Add to Release notes for this version in *CHANGELOG.md*
    - Add section about the update to the [CHANGELOG.md]
4. Make the package with the command below after changing `1.0.0` to the correct version number.

    **vsce** should be installed, if not give command `npm install -g vsce`
    **install** project should be installed `npm i`

    ```shell
    vsce package 1.0.0
    ```

    Test the package by installing it

    ```shell
    code --install-extension gepper-1.0.0.vsix
    ```

    Distribute the file `gepper-1.0.0.vsix`

    ```shell
    vsce publish
    ```

    If distribution fails you probably have an expired Personal Access Token so
    get a new one [here]( https://aka.ms/vscodepat) and do the following
    1. `vsce login guttih` and press `y`and return and paste then newly created PAT
    2. `vsce publish` This should publish an update to your extension.

    Here is a path to the [Portal](https://portal.azure.com/#home)

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
- Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
- Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

### Links

   Links relative to extension development

- [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)
- [API](https://code.visualstudio.com/api)
- [Variables](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_variables)

-

[Release notes]:./README.md#release-notes
[CHANGELOG.md]:./CHANGELOG.md
[package.json]:./package.json
[package-lock.json]:./package-lock.json
