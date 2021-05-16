/// <reference path="./test-module/index.d.ts" />

import { ESGlobalModuleResolver } from './index.js';


const esModuleResolver = new ESGlobalModuleResolver();

let resolvedPath: string;

try {
    resolvedPath = await esModuleResolver.load('./test-module', 8);
    // resolvedPath = await esModuleResolver.load('./test-module', 2);

    // resolvedPath = await esModuleResolver.load('./test-module/index');
    // resolvedPath = await esModuleResolver.load('./test-module/index.js');

    console.log(`\nResolved path: `, resolvedPath);
} catch (r) {
    console.log(`\n`);
    console.log(r);
    console.log(`\n`);
}

// este import é necessário porque o NodeJS ainda não entende algo que está carregado mas não foi importado ou requerido explicitamente
// import { TestModule } from './test-module/index.js';

const test: TestModule = new TestModule();
test.printExampleMessage();
