/// <reference path="./number-extension-by-folder/index.ts" />


import { ESLoadingResolver } from '../../../local/index.js';

import { IESLoadingResponse } from '../../../lib/i-es-loading-response.js';


const esLoadingResolver = new ESLoadingResolver();

let resolvedDirectory: IESLoadingResponse;


try {
    resolvedDirectory = await esLoadingResolver
        .import('../../global-number-extension-by-parent-folder',
        // .import('./number-extension-by-folder',
        // .import('./number-extension-by-folder/index.js',
        // .import('./number-extension-by-folder/index',
        // .import('./number-extension.js',
        // .import('./number-extension',
    {
            timeoutValue: 11
            // timeoutValue: 2
        }
    );

    console.log(`\nResolved directory: `, resolvedDirectory.absoluteDirectory);
    console.log(`\n`);
} catch (reason: any) {
    console.log(`\n`);
    console.log(reason);
    console.log(`\n`);
}

const number = new Number();
number.addedMethodExample();
