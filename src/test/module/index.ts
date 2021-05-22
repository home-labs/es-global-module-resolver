import { ESLoadingResolver } from '../../index.js';

import { IESLoadingResponse } from '../../lib/i-es-loading-response.js';


const esGlobalModuleResolver = new ESLoadingResolver('js');

let esLoadingResponse: IESLoadingResponse;

// for autocomplete purpose create a interface and import it here to use as type
let ESTestModule;


try {
    esLoadingResponse = await esGlobalModuleResolver
        // .importModule('../global-number-extension-by-parent-folder',
        .importModule('./es-test-module',
        // .importModule('./number-extension-by-folder/index.js',
        // .importModule('./number-extension-by-folder/index',
        // .importModule('./number-extension.js',
        // .importModule('./number-extension',
        {
            moduleName: 'ESTestModule',

            timeoutValue: 8
            // timeoutValue: 2
        }
    );

    console.log(`\nResolved directory: `, esLoadingResponse.absoluteDirectory);
    console.log(`\n`);
    ESTestModule = esLoadingResponse.default;
    console.log(`Module declaration: `, new ESTestModule());
    console.log(`\n`);
} catch (r) {
    console.log(`\n`);
    console.log(r);
    console.log(`\n`);
}

// declare const ESTestModule: InstanceType<any> = ``;
// // declare const Test: InstanceType<any>;
// const test = new esLoadingResponse.default();

// test.printATestMessage();
