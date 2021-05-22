/// <reference path="./number-extension-by-folder/index.ts" />


import { ESLoadingResolver } from '../../index.js';

import { IESLoadingResponse } from '../../lib/i-es-loading-response.js';


const esGlobalModuleResolver = new ESLoadingResolver('js');

let resolvedDirectory: IESLoadingResponse;


try {
    resolvedDirectory = await esGlobalModuleResolver.importModule('./number-extension-by-folder',
    // resolvedDirectory = await esGlobalModuleResolver.importModule('./number-extension-by-folder/index.js',
    // resolvedDirectory = await esGlobalModuleResolver.importModule('./number-extension-by-folder/index',
    // resolvedDirectory = await esGlobalModuleResolver.importModule('./number-extension.js',
    // resolvedDirectory = await esGlobalModuleResolver.importModule('./number-extension',
    {
            timeoutValue: 8
            // timeoutValue: 2
        }
    );

    console.log(`\nResolved directory: `, resolvedDirectory.absoluteDirectory);
    console.log(`\n`);
} catch (r) {
    console.log(`\n`);
    console.log(r);
    console.log(`\n`);
}

const number = new Number();
number.addedMethodExample();
