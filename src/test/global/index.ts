/// <reference path="./number-extension.ts" />


import { ESLoadingResolver } from '../../index.js';


const esGlobalModuleResolver = new ESLoadingResolver();

let resolvedDirectory: string;

try {
    resolvedDirectory = await esGlobalModuleResolver.loadGlobal('./number-extension.js', 8);
    // resolvedDirectory = await esGlobalModuleResolver.load('./number-extension.js', 2);

    // resolvedDirectory = await esGlobalModuleResolver.load('./number-extension/index');
    // resolvedDirectory = await esGlobalModuleResolver.load('./number-extension/index.js');

    console.log(`\nResolved directory: `, resolvedDirectory);
    console.log(`\n`);
} catch (r) {
    console.log(`\n`);
    console.log(r);
    console.log(`\n`);
}

const number = new Number();
number.addedMethodExample();
