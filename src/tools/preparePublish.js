
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

var getSnippetsFromFile = (filePath, inSnippets) => {
    var snippets = inSnippets? inSnippets : [];
    let stat = fs.statSync(filePath);

    if (stat.isFile()) {
        console.log("Reading '%s' ", filePath);
        snippets.push(JSON.parse(fs.readFileSync(filePath)));
    }

    return snippets;
};

var readSnippetsInFileToMdTableRows = (filePath) => {
    var snippets = getSnippetsFromFile(filePath);
    var mdContent = "";
    snippets.forEach(fileContent => {
        Object.keys(fileContent).forEach(function (key) {
            mdContent += mdTableEntry(key, fileContent[key]);
        });
    });
    return mdContent;
};

var readSnippetsInDirToMdTableRows = (dir) => {

    var filenames = fs.readdirSync(dir);
    var snippets = [];
    var mdContent = "";
    filenames.forEach(function (file, index) {
        // Make one pass and make the file complete
        var filePath = path.join(dir, file);

        snippets = getSnippetsFromFile(filePath, snippets);

    });

    snippets.forEach(fileContent => {
        Object.keys(fileContent).forEach(function (key) {
            mdContent += mdTableEntry(key, fileContent[key]);
        });
    });
    return mdContent;
};

var buildAndReplaceContent = () => {
    var cMdCppTableRows = readSnippetsInDirToMdTableRows(`${snippetDirs}${slash}cpp`);
    var cMdCMakeTableRows = readSnippetsInDirToMdTableRows(`${snippetDirs}${slash}cmake`);
    var cMdGitIgnoreTableRows = readSnippetsInFileToMdTableRows(`${snippetDirs}${slash}gitignore.json`);


    console.log(`Exporting snippet list to markdown file ${mdFile}`);
    if (lib.fileExists(mdFile)) {
        console.log('File exists');
    }
    var mdContent;
    mdContent = lib.replaceContent(fs.readFileSync(mdFile).toString(), "|:--------|:------|:------------|\n", "\n### CMake snippets", cMdCppTableRows);
    mdContent = lib.replaceContent(mdContent, "|:-------|:------|:------------|\n", "\n### .gitignore snippets", cMdCMakeTableRows);
    mdContent = lib.replaceContent(mdContent, "|:------|:------|:------------|\n", "\n\n[Top](#gepper-readme)", cMdGitIgnoreTableRows);
    return mdContent;
};
var newContent;
newContent = buildAndReplaceContent();
console.log("==================\n"); console.log(newContent); console.log("==================\n");
fs.writeFileSync(mdFile, newContent);
console.log(`Run optional commands to:\n`);
console.log(` - To create a new package:`);
console.log(`     vsce package ${packageJson.version}\n`);
console.log(` - To install this new package for testing:`);
console.log(`     code --install-extension gepper-${packageJson.version}.vsix\n\n`);



