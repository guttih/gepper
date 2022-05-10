# gepper README

Gepper is a C++ helper extension which includes snippets and adding classes.

## Features
 - **Quickly create a class** Right-click the explorer window and select from the context menu `Create a new C++ Class`
 - **Create a class in selected directory** Right-click folder in explorer window and create a class inside that folder.
 - **Run a command on save** Execute a shell command specified by you, each time you save a .cpp or a .h file.

This extension is in the early stages so very few snippets have been created.


## Extension Settings

This extension contributes the following settings:

### Class creation

#### Directory
Where shall the class be created.
* `cpp.gepper.classPath`: Where should classes be created, default is working directory.

#### Content

You can configure what files created will contain.  Use content commands (tokens) to create your preferred content. When you open the settings (you can look for gepper) you will see explanations on what each command does.  File naming schema can also be configured.

* `"cpp.gepper.classHeaderTemplate`: Content of a created header file for a class.
* `"cpp.gepper.classImplementationTemplate`: Content of your created source file for a class
* `"cpp.gepper.classHeaderFileNameScheme`: Name of your header file  for a class
* `"cpp.gepper.classImplementationFileNameScheme`: Name of your source  file for a class

#### Run shell command

* `"cpp.gepper.shellExecute.OnSave.Command`: Command to run after saving .h or a .cpp file.

## List of all snippets

**Prefix** is what you type to select the desired snippet.
| Prefix  | Title | Description |
|:--------|:------|:------------|
| #classvar | Add local class variable | Add class variable with getter and setter |


[Top](#gepper-readme)