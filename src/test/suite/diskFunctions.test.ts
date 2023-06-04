import * as assert from "assert";
import { test } from "mocha";
import * as path from "path";
import { DiskFunctions } from "../../DiskFunctions";

let dirProject = path.dirname(__dirname);
const sep = path.sep;
const gepperDir = `${sep}gepper${sep}`;
const index = dirProject.indexOf(gepperDir);
dirProject = dirProject.substring(0, index + 7);
let filePackage = path.join(dirProject, "package.json");
let dirBogus = "just/somthinghg/strange";


suite("DiskFunction file or directory exists", () => {
   
    test("Extract directory from file path", () => {
        assert.strictEqual(
            DiskFunctions.getDirectoryFromFilePath(filePackage),
            dirProject,
            "Directory should be the same as the project directory"
        );
        assert.strictEqual(
            DiskFunctions.getDirectoryFromFilePath("C:\\temp\\a.txt"),
            "C:\\temp",
            "Directory should be the same as the project directory using windows path"
        );
        assert.strictEqual(
            DiskFunctions.getDirectoryFromFilePath("/c/temp/a.txt"),
            "/c/temp",
            "Directory should be the same as the project directory using linux path"
        );
    });

    test("Dir exists", () => {
        assert.strictEqual(
            DiskFunctions.dirExists(dirProject),
            true,
            `Directory should exist!`
        );
    });
    test("Dir does not exists", () => {
        assert.strictEqual(
            DiskFunctions.dirExists(dirBogus),
            false,
            "Directory should NOT exist!"
        );
    });

    test("File exists", () => {
        assert.strictEqual(
            DiskFunctions.fileExists(filePackage),
            true,
            "File should exist"
        );
    });
    test("File does not exists", () => {
        assert.strictEqual(
            DiskFunctions.fileExists(dirBogus + "a.txt"),
            false,
            "File should not exist"
        );
    });
});

suite("DiskFunction Write to and delete file", () => {

    let testFile = path.join(dirProject, "test-file.txt");
    const contentToSave = "hello world\nand another line.·\n";

    console.log(`Writing and reading file ${testFile}`);
    test("Removing file if it exists", () => {
        if (DiskFunctions.fileExists(testFile)) {
            assert.strictEqual(
                DiskFunctions.deleteFile(testFile),
                true,
                "File deletion should have succeeded."
            );
        }
    });
    test("Writing to file", () => {
        assert.strictEqual(
            DiskFunctions.writeToFile(testFile, contentToSave),
            true,
            "File should exist"
        );
    });

    test("Read file content", () => {
        const content: String | null = DiskFunctions.readFromFile(testFile);
        assert.strictEqual(
            content,
            contentToSave,
            "Content read from file should match content written to it."
        );
    });
    test("Deleting file", () => {

        assert.strictEqual(
            DiskFunctions.deleteFile(testFile),
            true,
            "File should have been deleted successfully"
        );
        assert.strictEqual(
            DiskFunctions.deleteFile(testFile),
            false,
            "File should have been deleted earlier, and should therefore fail here."
        );
    });
});
