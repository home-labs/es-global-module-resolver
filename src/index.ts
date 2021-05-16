export class ESModuleResolver {

    private loadedModulePaths: string[];

    constructor() {
        this.loadedModulePaths = [];
    }

    load(path: string,
        fileExtension: string | number = 'js',
        timeoutValue: number = 0): Promise<string> {

        const indexPattern: RegExp = new RegExp(/(\/index)$/);

        const extensionPattern: RegExp = new RegExp(/(\.(?:[^\/:*?"<>|]+))$/);

        let countdown!: NodeJS.Timeout;

        if (typeof fileExtension === 'number') {
            timeoutValue = fileExtension;
            fileExtension = 'js';
        }

        if (indexPattern.test(path)) {
            path = `${path}.${fileExtension}`;
        } else if (!extensionPattern.test(path)) {
            path = `${path}/index.${fileExtension}`;
        }

        // for don't try to load a already loaded module
        if (this.loadedModulePaths.indexOf(path) >= 0) {
            return Promise.resolve(path);
        }

        return new Promise(
            (loadAccomplish: (path: string) => void, loadReject: (r: any) => void) => {

                const importPromise: Promise<void> = import(path);

                if (timeoutValue) {
                    countdown = setTimeout(
                        () => {
                            loadReject(new Error(
                                `The time to load the module defined as relative in "${path}" is over.`
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

                            loadAccomplish(path);
                            this.loadedModulePaths.push(path);
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
