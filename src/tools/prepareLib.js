const fs = require('fs');
const path = require('path');
const cp = require("child_process");
// Returns true if file exists otherwise it returns false.
module.exports.fileExists = function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch (err) {
        return false;
    }
};

/**
 * Replaces everything between two tokens and returns the result.
 * @param {string} content Original content which shall be changed.
 * @param {string} startToken newContent will be inserted after The first instance found matching the text in this token.
 * @param {string} endToken  newContent will be inserted before First instance of this text, found after startToken.
 * @param {string} newContent New content which will be inserted between the start and end tokens.
 * @returns {string|null} On success, the modified content.  On error, the return value is null.
 */
module.exports.replaceContent = function replaceContent(content, startToken, endToken, newContent) {
    let start = content.indexOf(startToken);
    let end = content.indexOf(endToken, start);
    if (start < 0) { console.error(`startToken "${startToken}" not found!`); return null; }
    if (end < 0) { console.error(`endToken "${endToken}" not found!`); return null; }
    let ret = content.substring(0, start + startToken.length);
    ret += newContent;
    ret += content.substring(end);


    return ret;
};

/**
 * 
 * @param   {string} workspaceDir Directory containing files package.json and package-lock.json
 * @returns {string|null} On success: new new version number string.  On error: null.
 */
module.exports.bump = function bump(workspaceDir) {
    let filePackage = path.join(workspaceDir, "package.json"),
        filePackageLock = path.join(workspaceDir, "package-lock.json"),
        fileBugReport = path.join(workspaceDir, ".github/ISSUE_TEMPLATE/bug_report.yml");
        fileChangeLog    = path.join(workspaceDir, "CHANGELOG.md");


    if (!module.exports.fileExists(filePackage) || !module.exports.fileExists(filePackageLock)) {
        console.error(`Files "package.json" and "package-lock.json" must be found in provided directory (${workspaceDir}).`);
        return null;
    }
    let packageContent = require(filePackage),
        packageLockContent = require(filePackageLock);
    let oldVersion = packageContent.version;
    if (oldVersion === undefined || packageLockContent.version === undefined) { return null; }
    let i = oldVersion.lastIndexOf('.');
    if (i < 2) { return null; }
    let prefix = oldVersion.substring(0, i);
    let oldNumStr = oldVersion.substring(i + 1);
    if (!module.exports.isPositiveInteger(oldNumStr, true)) { return null; }
    let newNum = Number(oldNumStr) + 1;
    let newVersion = `${prefix}.${newNum.toString()}`;

    packageContent.version = newVersion;
    packageLockContent.version = newVersion;
    packageLockContent.packages[""].version = newVersion;
    var newContent = JSON.stringify(packageContent, null, 4);
    try { fs.writeFileSync(filePackage, newContent); } catch (err) { console.error(err); console.log(`Unable to write to file ${path.basename(filePackage)}`); return null; }

    newContent = JSON.stringify(packageLockContent, null, 4);
    try { fs.writeFileSync(filePackageLock, newContent); } catch (err) { console.error(err); console.log(`Unable to write to file ${path.basename(filePackageLock)}`); return null; }

    //Ok, let's update .github/ISSUE_TEMPLATE/bug_report.md and add the new version to it
    let yml = fs.readFileSync(fileBugReport).toString();
    const indent = "      - ";
    const searchStr = `${indent}${oldVersion}`;
    let index = yml.indexOf(searchStr);
    if (index > -1) {
        yml = yml.replace(searchStr, `${indent}${newVersion}\n${searchStr}`);
        try { fs.writeFileSync(fileBugReport, yml); } catch (err) { console.error(err); console.log(`Unable to write to file ${path.basename(fileBugReport)}`); return null; }
    } else {
        console.error("Unable find old version in bug_report.yml so, I cannot update it.\n  You must do it manually in file:"+fileBugReport);
    }

    module.exports.bumpChangeLog(fileChangeLog, newVersion);
    

    return newVersion;
};

module.exports.isPositiveInteger = function isPositiveInteger(str, bTreatZeroAsPositive) {
    if (typeof str !== 'string') {
        return false;
    }
    const num = Number(str);

    if (Number.isInteger(num)) {
        return bTreatZeroAsPositive ? true : (num > 0);
    }

    return false;
};

module.exports.bumpChangeLog = function bumpChangeLog(file, newVersion) {
    console.log(`  file ${file}  NewVersion ${newVersion}`);
    let content = fs.readFileSync(file).toString();
    const TOKEN_VERSION_SECTION=`\n\n## [${newVersion}]\n\n`;
    const TOKEN_CONTENT_START = "All notable changes to the \"gepper\" extension will be documented in this file.";
    const TOKEN_CONTENT_END = "## [";
    let newText = `${TOKEN_VERSION_SECTION}### Fixed\n\n  - [#??](https://github.com/guttih/gepper/issues/??) - TODO: Insert the issue number and title.\n\n`
    newContent = module.exports.replaceContent(content, TOKEN_CONTENT_START, TOKEN_CONTENT_END, newText);
    fs.writeFileSync(file, newContent);
    cp.exec(file);
};