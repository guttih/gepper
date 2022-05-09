import { test } from "mocha";
import { Maintenance } from "../../maintenance";
import { FunctionTokenName, TokenWorker } from "../../tokenWorker";

suite("Maintenance", () => {
    test("Logging descriptions", () => {
        let allTokens = TokenWorker.getFunctionalTokens();
        let fileTokens = allTokens.filter(
            (e) =>
                e.value !== FunctionTokenName.classHeaderFileName &&
                e.value !== FunctionTokenName.classImplementationFileName
        );

        let templateFunctionDescription: string = Maintenance.makeAvailableCommandDescription(
            Maintenance.getDetailedInfo(allTokens, true)
        );
        let fileFunctionDescription: string = Maintenance.makeAvailableCommandDescription(
            Maintenance.getDetailedInfo(fileTokens, true)
        );
        const packageJson = Maintenance.getPackageJson();
        if (packageJson?.contributes?.Stuff) {
            packageJson.contributes.Stuff = "33";
        }

        Maintenance.makeTokenFunctionDescription("Content of your created header file. ", templateFunctionDescription);
        Maintenance.makeTokenFunctionDescription("Content of your created source file", templateFunctionDescription);
        Maintenance.makeTokenFunctionDescription("Name of your header file", fileFunctionDescription);
        Maintenance.makeTokenFunctionDescription("Name of your source file", fileFunctionDescription);

        console.log("---   fileFunctionDescription   ----");
        console.log(fileFunctionDescription);
        console.log("------------------------------------");
        console.log("-------- templateFunctions ---------");
        console.log(templateFunctionDescription);
        console.log("------------------------------------");
        console.log(JSON.stringify(packageJson, null, 4));
    });
});
