# Change Log

All notable changes to the "gepper" extension will be documented in this file.

## [0.6.11]

### Fixed

  - [#49](https://github.com/guttih/gepper/issues/#49) - Sometimes on save command will not run when a .h file is being saved.
    * Checking if file has languageId `c` or `cpp` instead of only checking for `cpp` languageId.
## [0.6.10]

### Fixed

  - Resolved an issue where selecting *Create new C++ Class here* via right-click on a folder in workspace did not function as expected on Windows. This issue has now been rectified.

## [0.6.9]

### Fixed

  - [#46](https://github.com/guttih/gepper/issues/46) - Want to be able to select adoc text and convert it to md.
    * Added commands:
      * Simple convert of selected AsciiDoc text to Git issue.\nConverting US### links to git issue links
      * Converts selected AsciiDoc User Story document to git issue.  ( Supports ID link format: <<US###>> )
    * Added above commands also, to context menu inside editor, when adoc is open in editor and some text is selected.


## [0.6.8]

### Adding

  - [#44](https://github.com/guttih/gepper/issues/44) - Feature request: Would like task allowing me to remove all comments from a c++ file.

## [0.6.7]

Removing annoying warnings

## [0.6.6]

Fixing context menu items when right clicking inside a class header.
Also handling now, if delectations of a class function has default values.

### Fixed

  - [#40](https://github.com/guttih/gepper/issues/40) - Global string in a headerfile with keyword class in it causes problems
  - [#41](https://github.com/guttih/gepper/issues/41) - Context menu item "Add operators to C++ class" showing to often

## [0.6.5]

Adding better class detection

### Fix

  - [#38](https://github.com/guttih/gepper/issues/38) Context menu with Add operators to C++ Class not appearing in header class

## [0.6.4]

### Fix

Adding better detection, for when function is not implemented.  Added detection for function specifiers which are in the beginning of a function declaration in a header file.

## [0.6.3]

### Changed

Minor changes to readme.

## [0.6.1]

### Changed
better detection when functions are not implemented and adding operators with space between type and ampersand instead of variable name and ampersand

## [0.6.0]

### Added

Open class header file, right click inside the editor window and select one
of these new options
  - **Add operators to C++ Class** and select one ore more of these operators to implement if they have not already been implemented
     - Class Assignment operator `objectA = objectB`
     - Class Equality operator `objectA == objectB`
     - Class Not equal operator `objectA != objectB`
     - Class Greater than operator `objectA > objectB`
     - Class Less than operator `objectA < objectB`
     - Class Greater than or Equal operator `objectA >= objectB`
     - Class Less than or Equal operator `objectA <= objectB"`
- **Implement missing class functions** If there are some functions declared in the header file, but not implemented you will get this option which will add those missing implementations to a class source file.

## [0.5.0]

### Added
- Command *Create new C++ CMake project with GoogleTest*. This command with create a C++ CMake boiler plate project, add one hello world library and one hello world application.
Included are CTest and GoogleTest examples.
- Added .gitignore specific snippets for *Visual Studio Code*, C*++* and *CMake*.

## [0.2.0]

### Added

- C++ New class header new class implementation snippets.
- CMake snippets to create a GoogleTest, CMake Test Project intended as a content for CMakeLists.txt.

### Changed

- In [README.md], snippet list have been split up in two tables which will be kept up-to-date by running a command.
- Addition of new snippets to the extension with lesser work.

## [Unreleased]

- Initial release


[README.md]: ./README.md
[Keep change log]: https://keepachangelog.com/en/1.0.0/