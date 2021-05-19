/// <reference path="test-module.d.ts" />

export { };

import { ESGlobalModuleResolver } from '../index.js';


const esGlobalModuleResolver = new ESGlobalModuleResolver();

let resolvedDirectory: string;

try {
    resolvedDirectory = await esGlobalModuleResolver.load('./test-module.js', 8);
    // resolvedDirectory = await esGlobalModuleResolver.load('./test-module.js', 2);

    // resolvedDirectory = await esGlobalModuleResolver.load('./test-module/index');
    // resolvedDirectory = await esGlobalModuleResolver.load('./test-module/index.js');

    console.log(`\nResolved directory: `, resolvedDirectory);
} catch (r) {
    console.log(`\n`);
    console.log(r);
    console.log(`\n`);
}

// este import é necessário porque o NodeJS ainda não entende algo que está carregado mas não foi importado ou requerido explicitamente
// import { TestModule } from './test-module/index.js';

const test: TestModule = new TestModule();
test.printExampleMessage();
