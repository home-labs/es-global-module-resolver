import { ModuleTrackTrace as CallerFileTrackTrace} from '@actjs.on/module-track-trace';

import path from 'path';
import url from 'url';


export class ESLoadingResolver {

    private indexPattern: RegExp;

    private extensionPattern: RegExp;

    private loadedModulePaths: string[];

    private relativePath!: string;

    private timeoutValue!: number;

    private fileExtension!: string;

    private callerFileTrackTrace: CallerFileTrackTrace;

    private absolutePath!: string;

    private resolvedPath!: string;

    constructor() {
        this.indexPattern = new RegExp(/(\/index)$/);

        this.extensionPattern = new RegExp(/(\.(?:[^\/:*?"<>|]+))$/);

        this.loadedModulePaths = [];

        this.callerFileTrackTrace = new CallerFileTrackTrace();
    }

    private resolveArguments() {

        const fileCallerURL: string = this.callerFileTrackTrace.getFileCallerURL();

        const currentDirectory: string = path.dirname(url.fileURLToPath(import.meta.url));

        const fileCallerDirectory: string = path.dirname(url.fileURLToPath(fileCallerURL));

        const relativeModulePath: string = path.relative(process.cwd(), fileCallerDirectory);

        const relativeRootPath = path.relative(currentDirectory, process.cwd());

        const relativeDirectory = `${relativeRootPath}/${relativeModulePath}`
            .replace(/(?:\\)/g, '/')
            .replace(/(?:\/){2,}/g, '/')
            .replace(/(?:\.{3,}\/)+/g, '../')
            .replace(/(?:\.\/){2,}/, './')
            .replace(/(?<=\b)(?:\.\/)+/g, '/');

        this.absolutePath = path.normalize(`${process.cwd()}/${relativeModulePath}`);

        this.resolvedPath = `${relativeDirectory}/${this.relativePath}`;

        if (typeof this.fileExtension === 'number') {
            this.timeoutValue = this.fileExtension;
            this.fileExtension = 'js';
        }

        if (this.indexPattern.test(this.relativePath)) {
            this.relativePath = `${this.relativePath}.${this.fileExtension}`;
        } else if (!this.extensionPattern.test(this.relativePath)) {
            this.relativePath = `${this.relativePath}/index.${this.fileExtension}`;
        }

    }

    // load(): Promise<void> {

    // }

    // For side-effects
    loadGlobal(relativePath: string,
        fileExtension: string | number = 'js',
        timeoutValue: number = 0): Promise<any> {

        this.relativePath = relativePath;

        this.fileExtension = fileExtension as string;

        this.timeoutValue = timeoutValue;

        this.resolveArguments();

        let countdown!: NodeJS.Timeout;

        return new Promise(
            (loadAccomplish: (response: string) => void, loadReject: (r: any) => void) => {

                // console.log(`arrive here with relative path: ${this.resolvedPath}`)
                const importPromise: Promise<void> = import(this.resolvedPath);

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

                            loadAccomplish(this.absolutePath);
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
