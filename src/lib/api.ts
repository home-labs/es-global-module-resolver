import { CallerFileTrackTrace } from '@actjs.on/caller-file-track-trace';

import Path from 'path';
import url from 'url';
import { existsSync } from 'fs';


import { IESLoadingOptions } from './i-es-loading-options';
import { IESLoadingResponse } from './i-es-loading-response';


export class ESLoadingResolver {

    private indexPattern: RegExp;

    private extensionPattern: RegExp;

    private loadedModulePaths: string[];

    private relativePath!: string;

    private timeoutValue: number;

    private fileExtension: string;

    private callerFileTrackTrace: CallerFileTrackTrace;

    private absolutePath!: string;

    private absoluteDirectory!: string;

    private resolvedPath!: string;

    constructor(fileExtension?: string, options?: IESLoadingOptions) {

        this.fileExtension = fileExtension || 'js';

        this.timeoutValue = options?.timeoutValue || 0;

        this.indexPattern = new RegExp(/(\/index)$/);

        this.extensionPattern = new RegExp(/(\.(?:[^\/:*?"<>|]+))$/);

        this.loadedModulePaths = [];

        this.callerFileTrackTrace = new CallerFileTrackTrace();

    }

    private convertPathSeparator(path: string): string {
        return path.replace(/(?:\\)/g, '/');
    }

    private removeUnecessaryPathSeparator(path: string): string {
        return path
            .replace(/(?<=\b)(?:\/\.\/)+/g, '/');
    }

    private treatPath(path: string): string {
        return this.removeUnecessaryPathSeparator(path
            .replace(/(?:\.{3,}\/)/g, '../')
            .replace(/(?:\/){2,}/g, '/')
            .replace(/\/$/, '')
            .replace(/(?:\.\/){2,}/, './'));
    }

    private removeFolders(path: string, count: number, pathSeparator?: string): string {

        let splittedPath: string[];

        if (!pathSeparator) {
            pathSeparator = Path.sep;
        }

        splittedPath = path.split(pathSeparator);

        return splittedPath.slice(0, splittedPath.length - count).join(pathSeparator);
    }

    private resolvePathData() {

        const parentDirectoryPattern: RegExp = new RegExp(/^(\.\.\/)+/);

        const currentDirectory: string = Path.dirname(url.fileURLToPath(import.meta.url));

        const relativeRootDirectory: string = Path.relative(currentDirectory, process.cwd());

        const fileCallerURL: string = this.callerFileTrackTrace.getFileCallerURL();

        let fileCallerDirectory: string = Path.dirname(url.fileURLToPath(fileCallerURL));

        let parentFoldersCount: number;

        let absolutePath4Test: string;

        this.relativePath = this
            .removeUnecessaryPathSeparator(this
                .treatPath(this.convertPathSeparator(this.relativePath)));

        if (parentDirectoryPattern.test(this.relativePath)) {
            parentFoldersCount = this.relativePath.split('../').length - 1;

            this.relativePath = this.relativePath.replace(parentDirectoryPattern, '');

            fileCallerDirectory = this.removeFolders(fileCallerDirectory, parentFoldersCount);
        }

        const relativeFileDirectory: string = Path.relative(process.cwd(), fileCallerDirectory);

        const relativeDirectory: string = this
            .convertPathSeparator(`${relativeRootDirectory}/${relativeFileDirectory}`);

        let absoluteDirectory: string = Path.resolve(relativeFileDirectory);

        if (this.indexPattern.test(this.relativePath)) {
            this.absolutePath = Path.normalize(Path
                .resolve(absoluteDirectory, `${this
                    .relativePath}.${this.fileExtension}`));
            this.relativePath = `${this.relativePath}.${this.fileExtension}`;
        } else if (this.extensionPattern.test(this.relativePath)) {
            this.absolutePath = Path.normalize(Path
                .resolve(absoluteDirectory, `${this.relativePath}`));
        } else {
            absolutePath4Test = Path.normalize(Path
                .resolve(absoluteDirectory, `${this
                    .relativePath}.${this.fileExtension}`));
            if (existsSync(absolutePath4Test)) {
                this.absolutePath = absolutePath4Test;
            } else {
                absoluteDirectory = Path.resolve(absoluteDirectory, `${this.relativePath}`);

                this.absolutePath = Path.normalize(`${absoluteDirectory}/index.${this.fileExtension}`);
                this.relativePath = `${this.relativePath}/index`;
            }

            this.relativePath = `${this.relativePath}.${this.fileExtension}`;
        }

        this.resolvedPath = this
            .removeUnecessaryPathSeparator(`${relativeDirectory}/${this.relativePath}`);
    }

    import(relativePath: string, options?: IESLoadingOptions): Promise<IESLoadingResponse> {

        this.relativePath = relativePath;

        this.timeoutValue = options?.timeoutValue || this.timeoutValue;

        this.resolvePathData();

        const accomplishData: IESLoadingResponse = {
            absoluteDirectory: ''
        };

        let countdown!: NodeJS.Timeout;

        let moduleName: string | undefined;

        let rejectMessage: string;

        if (Object.prototype.hasOwnProperty.call(options, 'moduleData')
            && Object.prototype.hasOwnProperty
                .call(options?.moduleData, (options as any).moduleData.accessorSymbol)) {

            moduleName = (options as any).moduleData[(options as any)
                .moduleData.accessorSymbol];
        }

        if (moduleName) {
            rejectMessage = `The time to load the module "${moduleName}" defined in "${this.absolutePath}" directory is over.`;
        } else {
            rejectMessage = `The time to load the file "${this.absolutePath}" is over.`;
        }

        return new Promise(
            (
                loadAccomplish: (esLoadingResponse: IESLoadingResponse) => void,
                loadReject: (reason: any) => void
            ) => {

                // import without inform a default module from 'path'; causes side-effects, so use it to load extensions of Built-in classes
                const importPromise: Promise<IESLoadingResponse> = import(this.resolvedPath);

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

                            accomplishData.absoluteDirectory = this.absolutePath;

                            loadAccomplish(accomplishData);
                            this.loadedModulePaths.push(this.absolutePath);
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
