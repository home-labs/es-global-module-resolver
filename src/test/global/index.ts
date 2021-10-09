/// <reference path="./number-extension-by-folder/index.ts" />


import { ESLoadingResolver } from '../../index.js';

import { ESLoadingResponseInterface } from '../../lib/esLoadingResponseInterface.js';


const esLoadingResolver = new ESLoadingResolver();

let resolvedDirectory: ESLoadingResponseInterface;


try {
    resolvedDirectory = await esLoadingResolver
        .import('../global-number-extension-by-parent-folder',
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

    console.log(`\nResolved path: `, resolvedDirectory.absolutePath);
    console.log(`\n`);
} catch (reason: any) {
    console.log(`\n`);
    console.log(reason);
    console.log(`\n`);
}

const number = new Number();
number.addedMethodExample();
