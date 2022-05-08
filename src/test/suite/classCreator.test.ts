import * as assert from "assert";
import { test } from "mocha";
import { ClassCreator } from "../../classCreator";

test("ClassCreator.isClassNameValid", function () {
    
    let b,name;           b=ClassCreator.isClassNameValid(name); assert.ok(!b, `undefined should be a invalid class name. isClassNameValid returned ${b}`);
    //Check valid names
    name = "abba";        b=ClassCreator.isClassNameValid(name); assert.ok( b, `Class name="${name}": Should be a valid Class name. isClassNameValid returned ${b}`);
    name = "abba_";       b=ClassCreator.isClassNameValid(name); assert.ok( b, `Class name="${name}": should be valid when starting with _. isClassNameValid returned ${b}`);
    name = "_abba";       b=ClassCreator.isClassNameValid(name); assert.ok( b, `Class name="${name}": should be valid when ending with _. isClassNameValid returned ${b}`);
    name = "_ab_ba_";     b=ClassCreator.isClassNameValid(name); assert.ok( b, `Class name="${name}": should be valid. isClassNameValid returned ${b}`);
    name = "ab_ba";       b=ClassCreator.isClassNameValid(name); assert.ok( b, `Class name="${name}": should be valid. isClassNameValid returned ${b}`);
    name = "_abba_";      b=ClassCreator.isClassNameValid(name); assert.ok( b, `Class name="${name}": should be valid when starting and ending with _ . isClassNameValid returned ${b}`);
    name = "abba123";     b=ClassCreator.isClassNameValid(name); assert.ok( b, `Class name="${name}": Class names can end with numbers. isClassNameValid returned ${b}`);
    name = "a1b3b_a123__";b=ClassCreator.isClassNameValid(name); assert.ok( b, `Class name="${name}": Should be valid. isClassNameValid returned ${b}`);
    //Check invalid names
    name = "";            b=ClassCreator.isClassNameValid(name); assert.ok(!b, `Class name="${name}": Empty string should be invalid. isClassNameValid returned ${b}`);
    name = " ";           b=ClassCreator.isClassNameValid(name); assert.ok(!b, `Class name="${name}": space string should be invalid. isClassNameValid returned ${b}`);
    name = "\t";          b=ClassCreator.isClassNameValid(name); assert.ok(!b, `Class name="${name}": tab string should be invalid. isClassNameValid returned ${b}`);
    name = "a\t";         b=ClassCreator.isClassNameValid(name); assert.ok(!b, `Class name="${name}": tab string should be invalid. isClassNameValid returned ${b}`);
    name = "!";           b=ClassCreator.isClassNameValid(name); assert.ok(!b, `Class name="${name}": Should be invalid Class name. isClassNameValid returned ${b}`);
    name = "123abba123";  b=ClassCreator.isClassNameValid(name); assert.ok(!b, `Class name="${name}": Class names are not allowed to start with numbers. isClassNameValid returned ${b}"`);
    name = "*123abba123"; b=ClassCreator.isClassNameValid(name); assert.ok(!b, `Class name="${name}": Class names cannot start with a symbol. isClassNameValid returned ${b}`);
    name = "123a#bba123"; b=ClassCreator.isClassNameValid(name); assert.ok(!b, `Class name="${name}": Class names cannot include symbols. isClassNameValid returned ${b}`);
    name = "-abba";       b=ClassCreator.isClassNameValid(name); assert.ok(!b, `Class name="${name}": Class names cannot start with symbol`);
    name = "ab-ba";       b=ClassCreator.isClassNameValid(name); assert.ok(!b, `Class name="${name}": Class names include symbols. isClassNameValid returned ${b}`);
    name = "abba!";       b=ClassCreator.isClassNameValid(name); assert.ok(!b, `Class name="${name}": Class names cannot end with symbols. isClassNameValid returned ${b}`);
    name = "a1b3b_a1$3__";b=ClassCreator.isClassNameValid(name); assert.ok(!b, `Class name="${name}": Should be invalid. isClassNameValid returned ${b}`);
    
});/*  */