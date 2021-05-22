/// <reference path="./number-extension.ts" />


import { ESLoadingResolver } from '../../index.js';

import { IESLoadingResponse } from '../../lib/i-es-loading-response.js';


const esGlobalModuleResolver = new ESLoadingResolver({ fileExtension: 'js' });

let resolvedDirectory: IESLoadingResponse;

try {
    resolvedDirectory = await esGlobalModuleResolver.importModule('./number-extension', 8);
    // resolvedDirectory = await esGlobalModuleResolver.importModule('./number-extension', 2);

    console.log(`\nResolved directory: `, resolvedDirectory.absoluteDirectory);
    console.log(`\n`);
} catch (r) {
    console.log(`\n`);
    console.log(r);
    console.log(`\n`);
}

const number = new Number();
number.addedMethodExample();
