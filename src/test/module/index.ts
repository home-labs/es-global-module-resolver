import { ESLoadingResolver } from '../../index.js';

import { IESLoadingResponse } from '../../lib/i-es-loading-response.js';


const esGlobalModuleResolver = new ESLoadingResolver('js');

let esLoadingResponse: IESLoadingResponse;

// for autocomplete purpose create a interface and import it here to use as type
let ESTestModule;


try {
    esLoadingResponse = await esGlobalModuleResolver
        // .import('../global-number-extension-by-parent-folder',
        .import('./es-test-module',
        // .import('./number-extension-by-folder/index.js',
        // .import('./number-extension-by-folder/index',
        // .import('./number-extension.js',
        // .import('./number-extension',
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
