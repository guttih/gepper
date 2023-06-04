# Gepper Settings

This document describes how and what you can configure gepper.

To find all settings that belong to this extension, just open settings and look
for the name `gepper`.  That should list all the available gepper configurable
 properties.


The extension recognizes some predefined tokens and replaces those tokens with
generated content based on the token name.  We will refer to these tokens as 
functional tokens in this document.

## Creating classes

When you create a class, you can configure it's name, default location and 
content.  The tables below shows available functional tokens and what those tokens will be
replaced with by the extension at class creation time.


### Class creation - Properties

A default content template for the two files **.h** and **.cpp** is created by 
the extension when it is installed.  You can configure these templates to 
fulfill your needs.

#### Class Creation Template - Functional tokens

*Available properties are*

* `cpp.gepper.classHeaderTemplate`: Content of a created header file for a class.
* `cpp.gepper.classImplementationTemplate`: Content of your created source file for a class

**Available Class creation template tokens are:**

*Available functional tokens are*

| Functional token | Will be replaced with |
| :----- | :----- |
| `{{__CLASS_NAME__}}` | Entered class name |
| `{{__CLASS_NAME_UPPER__}}` | Class name transformed to UPPERCASE |
| `{{__CLASS_NAME_LOWER__}}` | Class name transformed to lowercase |
| `{{__CLASS_NAME_LOWER_DASH__}}` | Class name transformed to lowerCase and every transformed uppercase character is prefixed with "-" |
| `{{__CLASS_NAME_LOWER_UNDER__}}` | Class name transformed to lowerCase and every transformed uppercase character is prefixed with "_" |
| `{{__CLASS_NAME_CAPITALIZE__}}` | First letter of entered class name is capitalized |
| `{{__HEADER_FILE_NAME__}}` | default header file name as entered in the settings |
| `{{__SOURCE_FILE_NAME__}}` | default source file name as entered in the settings |

#### Class creation naming schema - Properties

Naming the files at class creation time.

*Available properties are*

* `cpp.gepper.classHeaderFileNameScheme`: Name of your header file  for a class
* `cpp.gepper.classImplementationFileNameScheme`: Name of your source  file for a class

**Available Class creation naming schema tokens are:**

*Available functional tokens are*

| Functional token | Will be replaced with |
| :----- | :----- |
| `{{__CLASS_NAME__}}` | Entered class name |
| `{{__CLASS_NAME_UPPER__}}` | Class name transformed to UPPERCASE |
| `{{__CLASS_NAME_LOWER__}}` | Class name transformed to lowercase |
| `{{__CLASS_NAME_LOWER_DASH__}}` | Class name transformed to lowerCase and every transformed uppercase character is prefixed with "-" |
| `{{__CLASS_NAME_LOWER_UNDER__}}` | Class name transformed to lowerCase and every transformed uppercase character is prefixed with "_" |
| `{{__CLASS_NAME_CAPITALIZE__}}` | First letter of entered class name is capitalized |

## On save command

When you save a **.h** or a **.cpp** file you can make the extension call a shell 
command.  You can pass the saved file path and name to that command allowing you
to do all sorts of things to your file with tools un-supported by 
Visual Studio Code.

### On save command - Properties

* `cpp.gepper.shellExecute.OnSave.Command`: Command to run after saving .h or a .cpp file.

### On save command - Functional tokens

**Available On save command tokens are:**

*Available functional tokens are*

| Functional token | Will be replaced with |
| :----- | :----- |
| `{{__FILE_PATH__}}` | Path (with no ending slash) to the file |
| `{{__FILE_NAME__}}` | File name |

----------

## Example values

Here are examples of possible values using functional tokens.

### Class Header File Name Scheme
```
{{__CLASS_NAME__}}.h
```

### Class Implementation File Name Scheme
```
{{__CLASS_NAME__}}.cpp
```

### Class Header Template (.h)
```
#ifndef {{__CLASS_NAME_UPPER__}}_H
#define {{__CLASS_NAME_UPPER__}}_H
class {{__CLASS_NAME__}}
{
public:
    {{__CLASS_NAME__}}();
    ~{{__CLASS_NAME__}}();
private:
};
#endif
```

### Class Implementation Template (.cpp)
```
#include "{{__HEADER_FILE_NAME__}}"
{{__CLASS_NAME__}}::{{__CLASS_NAME__}}()
{
}
{{__CLASS_NAME__}}::~{{__CLASS_NAME__}}()
{
}
```

### On save command

**Command example** - how to make a copy of each file saved:
```
cp "{{__FILE_PATH__}}/{{__FILE_NAME__}}" "{{__FILE_PATH__}}/{{__FILE_NAME__}}.backup"
```