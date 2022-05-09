import { test } from "mocha";
import { Maintenance } from "../../maintenance";
import { FunctionTokenName, TokenWorker } from "../../tokenWorker";

suite("Maintenance", () => {
    test("Updating all token property descriptions in package.json", () => {
       
        // const packageJson = Maintenance.getPackageJson();
        const packageJson = Maintenance.getPackageJson();
        Maintenance.updateAllTokenPropertyDescriptions(packageJson);
        Maintenance.savePackageJsonToDisk(packageJson);
    });
});
