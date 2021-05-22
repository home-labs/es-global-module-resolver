import { ModuleTrackTrace as CallerFileTrackTrace} from '@actjs.on/module-track-trace';

import Path from 'path';
import url from 'url';
import { existsSync } from 'fs';


import { IESLoadingOptions } from './i-es-loading-options';
import { IESLoadingResponse } from './i-es-loading-response';


// declare const Test: InstanceType<any>;
// const test = new Test();


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

        this.fileExtension = fileExtension || 'mjs';

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
            // .replace(/(?:\\)/g, '/')
            .replace(/(?<=\b)(?:\/\.\/)+/g, '/');
    }

    private treatPath(path: string): string {
        return this.removeUnecessaryPathSeparator(path
            // .replace(/(?:\\){2,}/g, '\\')
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

    // qualquer coisa usar só este daqui, o outro parece desnecessário
    importModule(relativePath: string, options?: IESLoadingOptions
        // , fileExtension: string | number = 'js',
        // timeoutValue: number = 0
    ): Promise<IESLoadingResponse> {

        this.relativePath = relativePath;

        // this.fileExtension = options?.fileExtension as string;

        this.timeoutValue = options?.timeoutValue || this.timeoutValue;

        this.resolvePathData();

        let countdown!: NodeJS.Timeout;

        return new Promise(
            (
                loadAccomplish: (response: IESLoadingResponse) => void,
                loadReject: (r: any) => void
            ) => {

                // console.log(`arrive here with directory ${this.absoluteDirectory}`)

                // import without { ModuleDeclarion } from '...'; causes side-effects, so use it to load extensions of Built-in classes
                const importPromise: Promise<IESLoadingResponse> = import(this.resolvedPath);

                if (this.timeoutValue) {
                    countdown = setTimeout(
                        () => {
                            loadReject(
                                new Error(`The time to load the module defined in "${this.absolutePath}" directory is over.`)
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

                            loadAccomplish(
                                {
                                    default: response,
                                    absoluteDirectory: this.absolutePath
                                }
                            );
                            this.loadedModulePaths.push(this.absolutePath);
                        }
                    ).catch(
                        (r) => {
                            loadReject(new Error(r));
                        }
                    );

            }
        );
    }

    // For side-effects
    load(relativePath: string,
        fileExtension: string | number = 'js',
        timeoutValue: number = 0): Promise<IESLoadingResponse> {

        this.relativePath = relativePath;

        this.fileExtension = fileExtension as string;

        this.timeoutValue = timeoutValue;

        this.resolvePathData();

        let countdown!: NodeJS.Timeout;

        return new Promise(
            (loadAccomplish: (response: IESLoadingResponse) => void, loadReject: (r: any) => void) => {

                // console.log(`arrive here with directory ${this.absoluteDirectory}`)
                const importPromise: Promise<IESLoadingResponse> = import(this.resolvedPath);

                if (this.timeoutValue) {
                    countdown = setTimeout(
                        () => {
                            loadReject(
                                new Error(`The time to load the module defined in "${this.absolutePath}" directory is over.`)
                            );
                        },
                        this.timeoutValue
                    );
                }

                importPromise
                    .then(
                        () => {
                            if (countdown) {
                                clearTimeout(countdown);
                            }

                            loadAccomplish(
                                {
                                    absoluteDirectory: this.absoluteDirectory
                                }
                            );
                            this.loadedModulePaths.push(this.absolutePath);
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
