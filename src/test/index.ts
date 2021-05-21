/// <reference path="./test-module.ts" />


import { ESGlobalModuleResolver } from '../index.js';


const esGlobalModuleResolver = new ESGlobalModuleResolver();

let resolvedDirectory: string;

try {
    resolvedDirectory = await esGlobalModuleResolver.load('./test-module.cjs', 8);
    // resolvedDirectory = await esGlobalModuleResolver.load('./test-module.js', 2);

    // resolvedDirectory = await esGlobalModuleResolver.load('./test-module/index');
    // resolvedDirectory = await esGlobalModuleResolver.load('./test-module/index.js');

    console.log(`\nResolved directory: `, resolvedDirectory);
    console.log(`\n`);
} catch (r) {
    console.log(`\n`);
    console.log(r);
    console.log(`\n`);
}

const test = new TestModule();
// test.printExampleMessage();
