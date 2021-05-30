import { ESLoadingResolver } from '../../local/index.js';

import { IESLoadingResponse } from '../../lib/i-es-loading-response.js';

import { IESTestModule } from './i-es-test-module';


const esGlobalModuleResolver = new ESLoadingResolver();

const esTestModuleSymbol: symbol = Symbol();

let esLoadingResponse: IESLoadingResponse;

let ESTestModule: IESTestModule;

// Template Design Pattern
let esTestModule: IESTestModule;


try {
    esLoadingResponse = await esGlobalModuleResolver
        .import('./es-test-module',
            {
                moduleData: {
                    [esTestModuleSymbol]: 'ESTestModule',
                    accessorSymbol: esTestModuleSymbol
                },

                timeoutValue: 11
                // timeoutValue: 1
            }
        );

    console.log(`\nResolved path: `, esLoadingResponse.absolutePath);
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
