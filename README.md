# gepper README

Gepper is a C++ helper extension which includes snippets and adding classes.

## Features
 - **Create a new CMake C++ Project** Includes CTest and GoogleTest examples.
 - **Quickly create a class** Right-click the explorer window and select from the context menu `Create a new C++ Class`
 - **Create a class in selected directory** Right-click folder in explorer window and create a class inside that folder.
 - **Add common operators to C++ Class** Open class header file, right click inside the editor window and select `Add operators to C++ Class`
 - **Add missing implementations Class source file** Open class header file, right click inside the editor window and select `Implement missing class functions`
 - **Run a command on save** Execute a shell command specified by you, each time you save a .cpp or a .h file.

This extension is in the early stages so very few snippets have been created.


## Extension Settings

This extension contributes the following [settings]:

### Class creation

#### Directory
Default location, where class be created if you do not select a specific folder.
* `cpp.gepper.classPath`: Where should classes be created, default is working directory.

#### Content

You can configure what generated files created will contain.  Use content commands (tokens) to create your preferred content. When you open the settings (you can look for gepper) you will see explanations on what each command does.  File naming schema can also be configured.

* `cpp.gepper.classHeaderTemplate`: Content of a created header file for a class.
* `cpp.gepper.classImplementationTemplate`: Content of your created source file for a class
* `cpp.gepper.classHeaderFileNameScheme`: Name of your header file  for a class
* `cpp.gepper.classImplementationFileNameScheme`: Name of your source  file for a class

#### Run shell command

* `cpp.gepper.shellExecute.OnSave.Command`: Command to run after saving .h or a .cpp file.

## Snippet lists

**Prefix** is what you type to select the desired snippet.

### C++ snippets

| Prefix  | Title | Description |
|:--------|:------|:------------|
| class,<br>class header,<br>class declaration | Class declaration | Class declaration in a header file |
| class cpp,<br>class implementation,<br>class source | class Implementation | Class implementation for a source file |
| getterAndSetter | Add local class variable | Add class variable with getter and setter |
| CamelCase to SnakeCase | Convert string to SNAKE_CASE | Converts CameCaseWord to CAME_CASE_WORD |

### CMake snippets

| Prefix | Title | Description |
|:-------|:------|:------------|
| set,<br>set variable,<br>add variable | Declare a CMake variable | Add a variable |
| create googleTest Project | Create a GoogleTest CMake Project for your repository | Creates a GoogleTest CMake Project intended to be added to a file called CMakeLists.txt.  This is the entry point to GoogleTests, and all other GoogleTest projects should be in sub-directories of where this project is located |
| create sub executable project | Add a GoogleTest CMake child executable | Add a GoogleTest Test Application to an existing parent application. |

### .gitignore snippets

| Prefix| Title | Description |
|:------|:------|:------------|
| cmake | CMake project  .gitignore | Make git ignore all files that are re-creatable in CMake projects |
| c++,<br>cpp | C++ project .gitignore | Make git ignore all files that are re-creatable in C++ projects |
| cmake & c++,<br>cmake & cpp | CMake C++ project .gitignore | Make git ignore all files that are re-creatable in C++ CMake projects |
| cmake & c++ & vscode,<br>cmake & cpp & vscode | CMake C++ project in vscode .gitignore | Make git ignore all files that are re-creatable in C++ CMake projects including Visual Studio Code configuration files. |
| vscode,<br>Visual Studio Code | Visual Studio Code .gitignore | Ignore most of Visual Studio Code configuration files |


[Top](#gepper-readme)


[settings]: https://github.com/guttih/gepper/blob/main/docs/settings.md
