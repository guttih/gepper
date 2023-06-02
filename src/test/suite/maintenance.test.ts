import * as assert from "assert";
import { test } from "mocha";
import { Maintenance } from "../../maintenance";
import { FunctionTokenName, TokenWorker } from "../../tokenWorker";

suite("Maintenance", () => {
    test("Updating all token property descriptions in package.json", () => {
       
        const packageJson = Maintenance.getPackageJson();
        assert.ok(Maintenance.updateAllTokenPropertyDescriptions(packageJson), "Unable to update all token properties in package.json object");
        assert.ok(Maintenance.savePackageJsonToDisk(packageJson), "Unable to save new property descriptions to file package.json");

    });

    test("Updating all token property descriptions in package.json", () => {
       
        
        assert.ok(Maintenance.savePropertiesToSettingsMarkdown(), "Unable to update document settings.md");
    });
});
