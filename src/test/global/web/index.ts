/// <reference path="./number-extension-by-folder/index.ts" />

import { ESWebLoadingResolver } from '../../../web/index.js';
// import { ESWebLoadingResolver } from '@actjs.on/es-loading-resolver/web';

import { IESLoadingResponse } from '../../../lib/i-es-loading-response.js';


const esWebLoadingResolver = new ESWebLoadingResolver();

let resolvedDirectory: IESLoadingResponse;


try {
    resolvedDirectory = await esWebLoadingResolver
        .import('../../global-number-extension-by-parent-folder',
        // .import('./number-extension-by-folder',
        // .import('./number-extension-by-folder/index',
        // .import('./number-extension-by-folder/index.js',
        // .import('./number-extension.js',
        // this should generate an error
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
