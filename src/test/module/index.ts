import { ESLoadingResolver } from '../../index.js';

import { ESLoadingResponseInterface } from '../../lib/esLoadingResponseInterface.js';

import { ESTestModuleInterface } from './esTestModuleInterface';


const esGlobalModuleResolver = new ESLoadingResolver();

const esTestModuleSymbol: symbol = Symbol();

let esLoadingResponse: ESLoadingResponseInterface;

let ESTestModule: ESTestModuleInterface;

// Template Design Pattern
let esTestModule: ESTestModuleInterface;


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
