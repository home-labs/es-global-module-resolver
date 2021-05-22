/// <reference path="./number-extension-by-folder/index.ts" />


import { ESLoadingResolver } from '../../index.js';

import { IESLoadingResponse } from '../../lib/i-es-loading-response.js';


const esGlobalModuleResolver = new ESLoadingResolver('js');

let resolvedDirectory: IESLoadingResponse;


try {
    resolvedDirectory = await esGlobalModuleResolver
        .importModule('../global-number-extension-by-parent-folder',
        // .importModule('./number-extension-by-folder',
        // .importModule('./number-extension-by-folder/index.js',
        // .importModule('./number-extension-by-folder/index',
        // .importModule('./number-extension.js',
        // .importModule('./number-extension',
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
