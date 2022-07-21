# Change Log

All notable changes to the "gepper" extension will be documented in this file.

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