import { ModuleTrackTrace } from '@actjs.on/module-track-trace';

import path from 'path';
import url from 'url';

export class ESGlobalModuleResolver {

    private loadedModulePaths: string[];

    constructor() {
        this.loadedModulePaths = [];
    }

    load(relativePath: string,
        fileExtension: string | number = 'js',
        timeoutValue: number = 0): Promise<string> {

        const indexPattern: RegExp = new RegExp(/(\/index)$/);

        const extensionPattern: RegExp = new RegExp(/(\.(?:[^\/:*?"<>|]+))$/);

        const fileTracker: ModuleTrackTrace = new ModuleTrackTrace();

        const fileCallerURL: string = fileTracker.getFileCallerURL();

        const currentDirectory: string = path.dirname(url.fileURLToPath(import.meta.url));

        const fileCallerDirectory: string = path.dirname(url.fileURLToPath(fileCallerURL));

        const relativeRootPath = path.relative(currentDirectory, process.cwd());

        const relativeModulePath: string = path.relative(process.cwd(), fileCallerDirectory);

        const relativeDirectory = `././${relativeRootPath}./${relativeModulePath}`
            .replace(/(?:\\)/g, '/')
            .replace(/(?:\/){2,}/g, '/')
            .replace(/(?:\.{3,}\/)+/g, '../')
            .replace(/(?:\.\/){2,}/, './')
            .replace(/(?<=\b)(?:\.\/)+/g, '/');

        const absolutePath: string = path.normalize(`${process.cwd()}/${relativeModulePath}`);

        let resolvedPath: string;

        let countdown!: NodeJS.Timeout;

        if (typeof fileExtension === 'number') {
            timeoutValue = fileExtension;
            fileExtension = 'js';
        }

        if (indexPattern.test(relativePath)) {
            relativePath = `${relativePath}.${fileExtension}`;
        } else if (!extensionPattern.test(relativePath)) {
            relativePath = `${relativePath}/index.${fileExtension}`;
        }

        // for don't try to load a already loaded module
        if (this.loadedModulePaths.indexOf(absolutePath) >= 0) {
            return Promise.resolve(absolutePath);
        }

        resolvedPath = `${relativeDirectory}/${relativePath}`;

        return new Promise(
            (loadAccomplish: (response: string) => void, loadReject: (r: any) => void) => {

                // console.log(`arrive here with relative path: ${relativePath}`)
                const importPromise: Promise<void> = import(resolvedPath);

                if (timeoutValue) {
                    countdown = setTimeout(
                        () => {
                            loadReject(
                                new Error(`The time to load the module defined in "${absolutePath}" directory is over.`)
                            );
                        },
                        timeoutValue
                    );
                }

                importPromise
                    .then(
                        () => {
                            if (countdown) {
                                clearTimeout(countdown);
                            }

                            loadAccomplish(absolutePath);
                            this.loadedModulePaths.push(absolutePath);
                        }
                    ).catch(
                        (r) => {
                            loadReject(new Error(r));
                        }
                    );

            }
        );

    }
}
