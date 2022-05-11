import * as assert from "assert";
import { test } from "mocha";
import * as path from "path";
import { Executioner } from "../../executioner";

// const name = path.basename(__filename);
// const filePackage=path.join(dirProject, name);
suite("Executioner", () => {
    test("replaceTokens", () => {
        const text:string="~/repos/bin/uncrust.sh \"{{__FILE_PATH__}}\" \"{{__FILE_NAME__}}\"";
        const filename:string="~/projects/Qt/untitled1/testFolder/asdf.h";
        console.log(Executioner.replaceTokens(text, filename));
        assert.strictEqual(
            Executioner.replaceTokens(text, filename),
            "~/repos/bin/uncrust.sh \"~/projects/Qt/untitled1/testFolder\" \"asdf.h\"",
            "File should have been deleted successfully"
        );
        
    });
});
