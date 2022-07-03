
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
var lib = require('./prepareLib');

let slash = '/';
if (__dirname.indexOf('\\') > 0) {
    slash = '\\';
}
let workspaceDir = __dirname.replace(`${slash}src${slash}tools`, "");
let snippetDirs = workspaceDir + `${slash}snippets`;
let mdFile = workspaceDir + `${slash}README.md`;


let programArgs = process.argv.slice(2);
if (programArgs.length > 0) {

    if (programArgs.includes('-bump')) {
        programArgs = programArgs.filter(e => e !== '-bump');
        const newVersion = lib.bump(workspaceDir);
        if (newVersion === null) {
            console.error(`Unable to bump package: ${programArgs[0]}`);
            exit(1);
        }
        console.log(`Version bumped to ${newVersion}`);
    } else {
        console.error(`Invalid argument: ${programArgs[0]}`);
        exit(1);
    }
}
//fs.constants.R_OK
const packageJson = require(workspaceDir + `${slash}package.json`);

var mdTableEntry = (key, snippet) => {
    let prefix = snippet.prefix.toString().replace(/,/g, ",<br>");
    return `| ${prefix} | ${key} | ${snippet.description} |\n`;
};

var readSnippetsToMdTableRows = (dir) => {

    var filenames = fs.readdirSync(dir);
    var snippets = [];
    var mdContent = "";
    filenames.forEach(function (file, index) {
        // Make one pass and make the file complete
        var filePath = path.join(dir, file);
        let stat = fs.statSync(filePath);

        if (stat.isFile()) {
            console.log("Reading '%s' ", filePath);
            snippets.push(JSON.parse(fs.readFileSync(filePath)));
        }
    });

    snippets.forEach(fileContent => {
        Object.keys(fileContent).forEach(function (key) {
            mdContent += mdTableEntry(key, fileContent[key]);
        });
    });
    return mdContent;
};

var buildAndReplaceContent = () => {
    var cMdCppTableRows = readSnippetsToMdTableRows(`${snippetDirs}${slash}cpp`);
    var cMdCMakeTableRows = readSnippetsToMdTableRows(`${snippetDirs}${slash}cmake`);


    console.log(`Exporting snippet list to markdown file ${mdFile}`);
    if (lib.fileExists(mdFile)) {
        console.log('File exists');
    }
    var mdContent = lib.replaceContent(fs.readFileSync(mdFile).toString(),
        "|:--------|:------|:------------|\n",
        "\n### CMake snippets",
        cMdCppTableRows
    );
    var ret = lib.replaceContent(mdContent,
        "|:-------|:------|:------------|\n",
        "\n\n[Top](#gepper-readme)",
        cMdCMakeTableRows
    );
    return ret;
};
var newContent;
newContent = buildAndReplaceContent();
console.log("==================\n"); console.log(newContent); console.log("==================\n");
fs.writeFileSync(mdFile, newContent);
console.log(`Extension version:  ${packageJson.version}`);


