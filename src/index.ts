import path from 'path';

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

        let countdown!: NodeJS.Timeout;

        let absolutePath: string;

        if (typeof fileExtension === 'number') {
            timeoutValue = fileExtension;
            fileExtension = 'js';
        }

        if (indexPattern.test(relativePath)) {
            relativePath = `${relativePath}.${fileExtension}`;
        } else if (!extensionPattern.test(relativePath)) {
            relativePath = `${relativePath}/index.${fileExtension}`;
        }

        absolutePath = `${path.dirname(import.meta.url)}/${relativePath}`;

        // for don't try to load a already loaded module
        if (this.loadedModulePaths.indexOf(absolutePath) >= 0) {
            return Promise.resolve(absolutePath);
        }

        return new Promise(
            (loadAccomplish: (response: string) => void, loadReject: (r: any) => void) => {

                const importPromise: Promise<void> = import(absolutePath);

                if (timeoutValue) {
                    countdown = setTimeout(
                        () => {
                            loadReject(new Error(
                                `The time to load the module defined as relative in "${absolutePath}" is over.`
                                )
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
