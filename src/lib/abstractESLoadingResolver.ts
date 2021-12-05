import Path from 'path';

import { ESLoadingOptionsInterface } from './esLoadingOptionsInterface.js';
import { ESLoadingResponseInterface } from './esLoadingResponseInterface.js';


export abstract class AbstractESLoadingResolver {

    protected readonly indexPattern: RegExp;

    protected readonly extensionPattern: RegExp;

    protected fileExtension: string;

    private timeoutValue: number;

    private loadedModulePaths: string[];

    constructor(fileExtension?: string, options?: ESLoadingOptionsInterface) {

        this.timeoutValue = options?.timeoutValue || 0;

        this.loadedModulePaths = [];

        this.indexPattern = new RegExp(/\/index$/);

        this.extensionPattern = new RegExp(/\.(?!.+\.)(.+)/);

        this.fileExtension = fileExtension || 'js';

    }

    protected abstract resolvePath(relativePath: string): string;

    protected abstract getAbsolutePath(): string;

    protected convertPathSeparator(path: string): string {
        return path.replace(/(?:\\)/g, '/');
    }

    protected removeUnecessaryPathSeparator(path: string): string {
        return path
            .replace(/(?<=\b)(?:\/\.\/)+/g, '/');
    }

    protected treatPath(path: string): string {
        return this.removeUnecessaryPathSeparator(path
            .replace(/(?:\.{3,}\/)/g, '../')
            .replace(/(?:\/){2,}/g, '/')
            .replace(/\/$/, '')
            .replace(/(?:\.\/){2,}/, './'));
    }

    import(relativePath: string,
        options?: ESLoadingOptionsInterface): Promise<ESLoadingResponseInterface> {

        const resolvedPath: string = this.resolvePath(relativePath);

        const accomplishData: ESLoadingResponseInterface = {
            absolutePath: ''
        };

        let countdown!: NodeJS.Timeout;

        let moduleName: string | undefined;

        let rejectMessage: string;

        this.timeoutValue = options?.timeoutValue || this.timeoutValue;

        if (options
            && Object.prototype.hasOwnProperty.call(options, 'moduleData')
            && Object.prototype.hasOwnProperty
                .call(options?.moduleData, (options as any).moduleData.accessorSymbol)) {

            moduleName = (options as any).moduleData[(options as any)
                .moduleData.accessorSymbol];
        }

        if (moduleName) {
            rejectMessage = `The time to load the module "${moduleName}" defined in "${this.getAbsolutePath()}" directory is over.`;
        } else {
            rejectMessage = `The time to load the file "${this.getAbsolutePath()}" is over.`;
        }

        return new Promise(
            (
                loadAccomplish: (esLoadingResponse: ESLoadingResponseInterface) => void,
                loadReject: (reason: any) => void
            ) => {

                // import without inform a default module from 'path'; causes side-effects, so use it to load extensions of Built-in classes
                // console.log(resolvedPath)
                const importPromise: Promise<ESLoadingResponseInterface> = import(resolvedPath);

                if (this.timeoutValue) {
                    countdown = setTimeout(
                        () => {
                            loadReject(
                                new Error(rejectMessage)
                            );
                        },
                        this.timeoutValue
                    );
                }

                importPromise
                    .then(
                        (response: any) => {

                            if (countdown) {
                                clearTimeout(countdown);
                            }

                            if (Object.prototype.hasOwnProperty.call(response, 'default')) {
                                response = (response as any).default;
                                accomplishData.default = response;
                            } else if (moduleName) {
                                response = response[moduleName];

                                (accomplishData as any)[(options as any)
                                    .moduleData.accessorSymbol] = response;
                            }

                            accomplishData.absolutePath = this.getAbsolutePath();

                            loadAccomplish(accomplishData);
                            this.loadedModulePaths.push(this.getAbsolutePath());
                        }
                    ).catch(
                        (reason: any) => {
                            loadReject(new Error(reason));
                        }
                    );

            }
        );
    }

}
