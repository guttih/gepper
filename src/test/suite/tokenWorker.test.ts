import * as assert from "assert";
import { test } from "mocha";
import { TokenWorker, FunctionTokenName } from "../../tokenWorker";

const before =
    "#ifndef {{__CLASS_NAME_UPPER__}}_H\n\t\t#define {{__CLASS_NAME_UPPER__}}_H\n\t\t\n\t\t#pragma once\n\t\t\n\t\tclass {{__CLASS_NAME__}}\n\t\t{\n\t\tpublic:\n\t\t	{{__CLASS_NAME__}}();\n\t\t	~{{__CLASS_NAME__}}();\n\t\t\n\t\tprivate:\n\t\t\n\t\t};\n\t\t\n\t\t#endif";

suite("TokenWorker", () => {
    test("replaceValues", () => {
        const testValue = "XXXXXXXXXXXx";
        assert.ok(
            before.indexOf(testValue) === -1,
            `Invalid test because it already contains "${testValue}"`
        );

        let after = TokenWorker.replaceValues(before, TokenWorker.createToken(FunctionTokenName.className), testValue);

        var count = (after.match(/XXXXXXXXXXXx/g) || []).length;
        // console.log(after);
        // console.log(`Replace count: ${count}`);
        assert.ok(
            after.indexOf(testValue) > -1,
            `replaceValues did not replace value as it should have`
        );
        assert.ok(
            count === 3,
            `There should be exactly 3 occurrences of \"${testValue}\" in the resulting textj.`
        );
    });

    suite("TokenFunctions", () => {
        test("toLower", () => {
            assert.strictEqual(TokenWorker.toLower("ClassNameDudeX", "-" ), "class-name-dude-x", "Class name not correctly lowered and  hyphenated.");
            assert.strictEqual(TokenWorker.toLower("ClassName1Dude",  "__"), "class__name1__dude", "Class name not correctly lowered.");
            assert.strictEqual(TokenWorker.toLower("ClassName1DudeX"      ), "classname1dudex", "Class name not correctly lowered.");
        });
    });
});