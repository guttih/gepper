import * as assert from "assert";
import { test } from "mocha";
import { TokenWorker } from "../../tokenWorker";

const before =
"#ifndef {{__CLASSNAMEUPPER__}}_H\n\t\t#define {{__CLASSNAMEUPPER__}}_H\n\t\t\n\t\t#pragma once\n\t\t\n\t\tclass {{__CLASSNAME__}}\n\t\t{\n\t\tpublic:\n\t\t	{{__CLASSNAME__}}();\n\t\t	~{{__CLASSNAME__}}();\n\t\t\n\t\tprivate:\n\t\t\n\t\t};\n\t\t\n\t\t#endif";

test("TokenWorker.replaceValues", function () {
    const worker = new TokenWorker();
    const testValue="XXXXXXXXXXXx";
    assert.ok(before.indexOf(testValue) === -1, `Invalid test because it already contains "${testValue}"`);
    
    let after = worker.replaceValues(before, "CLASSNAME", testValue);
    
    var count = (after.match(/XXXXXXXXXXXx/g) || []).length;
    // console.log(after);
    // console.log(`Replace count: ${count}`);
    assert.ok(after.indexOf(testValue) > -1, `replaceValues did not replace value as it should have`);
    assert.ok(count === 3, `There should be exactly 3 occurrences of \"${testValue}\" in the resulting textj.`);
    
});

