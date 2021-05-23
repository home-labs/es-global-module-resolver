import { ESLoadingResolver } from '../../index.js';

import { IESLoadingResponse } from '../../lib/i-es-loading-response.js';

import { IESTestModule } from './i-es-test-module';


const esGlobalModuleResolver = new ESLoadingResolver();

let esLoadingResponse: IESLoadingResponse;

let ESTestModule: IESTestModule;

// Template Design Pattern
let esTestModule: IESTestModule;


const esTestModuleSymbol: symbol = Symbol();


try {
    esLoadingResponse = await esGlobalModuleResolver
        // .import('../global-number-extension-by-parent-folder',
        .import('./es-test-module',
        // .import('./number-extension-by-folder/index.js',
        // .import('./number-extension-by-folder/index',
        // .import('./number-extension.js',
        // .import('./number-extension',
            {
                moduleData: {
                    [esTestModuleSymbol]: 'ESTestModule',
                    accessorSymbol: esTestModuleSymbol
                },

                timeoutValue: 11
                // timeoutValue: 1
            }
        );

    console.log(`\nResolved directory: `, esLoadingResponse.absoluteDirectory);
    console.log(`\n`);
    // ESTestModule = esLoadingResponse.default;
    ESTestModule = (esLoadingResponse as any)[esTestModuleSymbol];
    // console.log(esLoadingResponse)
    esTestModule = new (ESTestModule as any)();
    esTestModule.printATestMessage();
    console.log(`\n`);
} catch (r) {
    console.log(`\n`);
    console.log(r);
    console.log(`\n`);
}
