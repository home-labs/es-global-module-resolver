import { CallerFileTrackTrace } from '@actjs.on/caller-file-track-trace';

import Path from 'path';
import url from 'url';
import fs from 'fs';

import { AbstractESLoadingResolver } from './abstractESLoadingResolver.js';
import { ESLoadingOptionsInterface } from './esLoadingOptionsInterface.js';


export class ESLoadingResolver extends AbstractESLoadingResolver {

    private callerFileTrackTrace: CallerFileTrackTrace;

    private absolutePath!: string;

    constructor(fileExtension?: string, options?: ESLoadingOptionsInterface) {
        super(fileExtension, options);

        this.callerFileTrackTrace = new CallerFileTrackTrace();
    }

    protected getAbsolutePath(): string {
        return this.absolutePath;
    }

    protected resolvePath(relativePath: string): string {

        const parentDirectoryPattern: RegExp = new RegExp(/^(\.\.\/)+/);

        const currentPath: string = Path.dirname(url.fileURLToPath(import.meta.url));

        // console.log(currentPath)

        // the AbstractESLoadingResolver is who will actually import, but "import.meta.url" returns the current file url. The .removeFloors method should be used in cases where the calling file of this file is in one or more of the above directories, so use 1 or more as last parameter.
        // instalar no-dir, se for o caso, e usar o método removeChildFloorsFrom de Helper
        const relativeRootDirectory: string = this
            .removeFloors(Path.relative(currentPath, process.env.PWD as string), 0);

        // console.log(relativeRootDirectory)

        const fileCallerURL: string = this.callerFileTrackTrace.getFileCallerURL();

        // console.log(fileCallerURL);

        let fileCallerPath: string = Path.dirname(url.fileURLToPath(fileCallerURL));

        let parentFoldersCount: number;

        let absolutePath4Test: string;

        let relativeFileCallerDirectory: string;

        let relativeDirectory: string;

        let absoluteDirectory: string;

        relativePath = this
            .removeUnecessaryPathSeparator(this
                .treatPath(this.convertPathSeparator(relativePath)));

        if (parentDirectoryPattern.test(relativePath)) {

            parentFoldersCount = relativePath.split('../').length - 1;

            relativePath = relativePath.replace(parentDirectoryPattern, '');

            fileCallerPath = this.removeFloors(fileCallerPath, parentFoldersCount);
            // console.log(fileCallerPath);
        }

        relativeFileCallerDirectory = Path.relative(process.env.PWD as string, fileCallerPath);

        relativeDirectory = this
            .convertPathSeparator(`${relativeRootDirectory}/${relativeFileCallerDirectory}`);

        absoluteDirectory = Path.resolve(relativeFileCallerDirectory);

        if (this.indexPattern.test(relativePath)) {
            this.absolutePath = Path.normalize(Path
                .resolve(absoluteDirectory, `${relativePath}.${this.fileExtension}`));
            relativePath = `${relativePath}.${this.fileExtension}`;
        } else if (this.extensionPattern.test(relativePath)) {
            this.absolutePath = Path.normalize(Path
                .resolve(absoluteDirectory, `${relativePath}`));
        } else {
            absolutePath4Test = Path.normalize(Path
                .resolve(absoluteDirectory, `${relativePath}.${this.fileExtension}`));
            if (fs.existsSync(absolutePath4Test)) {
                this.absolutePath = absolutePath4Test;
            } else {
                absoluteDirectory = Path.resolve(absoluteDirectory, `${relativePath}`);
                this.absolutePath = Path.normalize(`${absoluteDirectory}/index.${this.fileExtension}`);

                relativePath = `${relativePath}/index`;
            }

            relativePath = `${relativePath}.${this.fileExtension}`;
        }

        return this
            .removeUnecessaryPathSeparator(`${relativeDirectory}/${relativePath}`);
    }

}
