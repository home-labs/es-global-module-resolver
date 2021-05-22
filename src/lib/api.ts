import { ModuleTrackTrace as CallerFileTrackTrace} from '@actjs.on/module-track-trace';

import path from 'path';
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

    constructor(options?: IESLoadingOptions) {

        this.fileExtension = options?.fileExtension as string | 'mjs';

        this.timeoutValue = options?.timeoutValue as number | 0;

        this.indexPattern = new RegExp(/(\/index)$/);

        this.extensionPattern = new RegExp(/(\.(?:[^\/:*?"<>|]+))$/);

        this.loadedModulePaths = [];

        this.callerFileTrackTrace = new CallerFileTrackTrace();

    }

    private resolveArguments() {

        const fileCallerURL: string = this.callerFileTrackTrace.getFileCallerURL();

        const currentDirectory: string = path.dirname(url.fileURLToPath(import.meta.url));

        const fileCallerDirectory: string = path.dirname(url.fileURLToPath(fileCallerURL));

        const relativeFileDirectory: string = path.relative(process.cwd(), fileCallerDirectory);

        const relativeRootDirectory = path.relative(currentDirectory, process.cwd());

        const relativeDirectory = `${relativeRootDirectory}/${relativeFileDirectory}`
            .replace(/(?:\\)/g, '/')
            .replace(/(?:\/){2,}/g, '/')
            .replace(/(?:\.{3,}\/)+/g, '../')
            .replace(/(?:\.\/){2,}/, './')
            .replace(/(?<=\b)(?:\.\/)+/g, '/');

        this.resolvedPath = `${relativeDirectory}/${this.relativePath}`;

        // if (typeof this.fileExtension === 'number') {
        //     this.timeoutValue = this.fileExtension;
        //     this.fileExtension = 'js';
        // }

        // console.log(this.absolutePath)
        // console.log(this.absoluteDirectory)

        // console.log(!this.extensionPattern.test(this.relativePath))
        // testar
        if (this.indexPattern.test(this.relativePath)) {
            this.relativePath = `${this.relativePath}.${this.fileExtension}`;
        } else {
            // aqui pode estar falando de um arquivo sem extensão informada - caso em que bastaria acrescentar a extensão - ou de um diretório onde há um arquivo index com a extensão informada no método ou no constructor
            // if () {

            // }

            // if (!this.extensionPattern.test(this.relativePath)) {
            //     this.relativePath = `${this.relativePath}/index.${this.fileExtension}`;
            // }
        }

        // this.absolutePath = path.normalize(`${process.cwd()}/${relativeFileDirectory}`);

        // this.absoluteDirectory = path.dirname(this.absolutePath);
        console.log(this.relativePath)

    }

    // qualquer coisa usar só este daqui, o outro parece desnecessário
    importModule(relativePath: string, options?: IESLoadingOptions
        // , fileExtension: string | number = 'js',
        // timeoutValue: number = 0
    ): Promise<IESLoadingResponse> {

        this.relativePath = relativePath;

        this.fileExtension = options?.fileExtension as string;

        this.timeoutValue = options?.timeoutValue as number;

        this.resolveArguments();

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

        this.resolveArguments();

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
