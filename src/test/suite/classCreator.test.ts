import * as assert from "assert";
import { test } from "mocha";
import { ClassCreator } from "../../classCreator";

suite("ClassCreator", () => {
    suite("isClassNameValid", () => {
        test("Valid names", function () {
            let b, name;
            name = "abba";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(b, `Class name="${name}": Should be a valid Class name. isClassNameValid returned ${b}`);
            name = "abba_";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(b, `Class name="${name}": should be valid when starting with _. isClassNameValid returned ${b}`);
            name = "_abba";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(b, `Class name="${name}": should be valid when ending with _. isClassNameValid returned ${b}`);
            name = "_ab_ba_";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(b, `Class name="${name}": should be valid. isClassNameValid returned ${b}`);
            name = "ab_ba";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(b, `Class name="${name}": should be valid. isClassNameValid returned ${b}`);
            name = "_abba_";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(
                b,
                `Class name="${name}": should be valid when starting and ending with _ . isClassNameValid returned ${b}`
            );
            name = "abba123";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(b, `Class name="${name}": Class names can end with numbers. isClassNameValid returned ${b}`);
            name = "a1b3b_a123__";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(b, `Class name="${name}": Should be valid. isClassNameValid returned ${b}`);
        });

        test("Invalid names", function () {
            let b, name;
            b = ClassCreator.isClassNameValid(name);
            assert.ok(!b, `undefined should be a invalid class name. isClassNameValid returned ${b}`);
            name = "";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(!b, `Class name="${name}": Empty string should be invalid. isClassNameValid returned ${b}`);
            name = " ";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(!b, `Class name="${name}": space string should be invalid. isClassNameValid returned ${b}`);
            name = "\t";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(!b, `Class name="${name}": tab string should be invalid. isClassNameValid returned ${b}`);
            name = "a\t";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(!b, `Class name="${name}": tab string should be invalid. isClassNameValid returned ${b}`);
            name = "!";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(!b, `Class name="${name}": Should be invalid Class name. isClassNameValid returned ${b}`);
            name = "123abba123";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(
                !b,
                `Class name="${name}": Class names are not allowed to start with numbers. isClassNameValid returned ${b}"`
            );
            name = "*123abba123";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(
                !b,
                `Class name="${name}": Class names cannot start with a symbol. isClassNameValid returned ${b}`
            );
            name = "123a#bba123";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(!b, `Class name="${name}": Class names cannot include symbols. isClassNameValid returned ${b}`);
            name = "-abba";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(!b, `Class name="${name}": Class names cannot start with symbol`);
            name = "ab-ba";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(!b, `Class name="${name}": Class names include symbols. isClassNameValid returned ${b}`);
            name = "abba!";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(!b, `Class name="${name}": Class names cannot end with symbols. isClassNameValid returned ${b}`);
            name = "a1b3b_a1$3__";
            b = ClassCreator.isClassNameValid(name);
            assert.ok(!b, `Class name="${name}": Should be invalid. isClassNameValid returned ${b}`);
        });
    });
    suite("Get templates", () => {
        const maker = new ClassCreator("CTestStuff");
        test("getRawHeaderTemplate", () => {
            let content: string | undefined = maker.getRawHeaderFileName();
            assert.ok(content !== undefined, "Unable to get raw header template template");
        });

        test("getRawImplementationTemplate", () => {
            let content: string | undefined = maker.getRawImplementationFileName();
            assert.ok(content !== undefined, "Unable to get raw implementation template");
        });
        test("getHeaderContent", () => {
            let content: string | undefined = maker.createHeaderContent();
            assert.ok(content !== undefined, "Unable to get header template content");
        });

        test("getImplementationContent", () => {
            let content: string | undefined = maker.createImplementationContent();
            assert.ok(content !== undefined, "Unable to get implementation template");
        });
    });

    suite("Filename scheme", () => {
        const name = "KlassiMan";
        const path = "/path/to/project";

        test("Get file.h file name", () => {
            const creator = new ClassCreator(name, path);
            assert.strictEqual(creator.getHeaderFileName(false), `${name}.h`);
        });
        test("Get file.cpp file name", () => {
            const creator = new ClassCreator(name, path);
            assert.strictEqual(creator.getImplementationFileName(false), `${name}.cpp`);
        });
        test("Get file.h names with path", () => {
            const creator = new ClassCreator(name, path);
            assert.strictEqual(creator.getHeaderFileName(true), `${path}/${name}.h`);
        });
        test("Get file.cpp names with path", () => {
            const creator = new ClassCreator(name, path);
            assert.strictEqual(creator.getImplementationFileName(true), `${path}/KlassiMan.cpp`);
        });
    });
});
