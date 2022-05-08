import * as assert from "assert";
import { exists } from "fs";
import { test } from "mocha";
import * as path from "path";
import { join } from "path";
import { DiskFunctions } from "../../diskFunctions";

let dirProject = path.dirname(__dirname);
let index = dirProject.indexOf("/gepper/");
dirProject = dirProject.substring(0, index + 7);
let filePackage = path.join(dirProject, "package.json");
let dirBogus = "just/somthinghg/strange";

// const name = path.basename(__filename);
// const filePackage=path.join(dirProject, name);
suite("DiskFunction file or directory exists", () => {
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
    
    let testFile=path.join(dirProject, "test-file.txt");
    const contentToSave = "hello world\nand another line.·\n"

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
        const content:String|null = DiskFunctions.readFromFile(testFile);
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
