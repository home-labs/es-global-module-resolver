import { CallerFileTrackTrace } from '@actjs.on/caller-file-track-trace';

import Path from 'path';
import url from 'url';
import { existsSync } from 'fs';

import { AbstractESLoadingResolver } from '../abstract-es-loading-resolver.js';
import { IESLoadingOptions } from '../i-es-loading-options';


export class ESLoadingResolver extends AbstractESLoadingResolver {

    private callerFileTrackTrace: CallerFileTrackTrace;

    private absolutePath!: string;

    constructor(fileExtension?: string, options?: IESLoadingOptions) {
        super(fileExtension, options);

        this.callerFileTrackTrace = new CallerFileTrackTrace();
    }

    protected getAbsolutePath(): string {
        return this.absolutePath;
    }

    protected resolvePathData(relativePath: string): string {

        const parentDirectoryPattern: RegExp = new RegExp(/^(\.\.\/)+/);

        const currentDirectory: string = Path.dirname(url.fileURLToPath(import.meta.url));

        // 'cause the AbstractESLoadingResolver it's in an above directory and it's who will call the import
        const relativeRootDirectory: string = this
            .removeFloors(Path.relative(currentDirectory, process.cwd()), 1);

        const fileCallerURL: string = this.callerFileTrackTrace.getFileCallerURL();

        let fileCallerDirectory: string = Path.dirname(url.fileURLToPath(fileCallerURL));

        let parentFoldersCount: number;

        let absolutePath4Test: string;

        relativePath = this
            .removeUnecessaryPathSeparator(this
                .treatPath(this.convertPathSeparator(relativePath)));

        if (parentDirectoryPattern.test(relativePath)) {

            parentFoldersCount = relativePath.split('../').length - 1;

            relativePath = relativePath.replace(parentDirectoryPattern, '');

            fileCallerDirectory = this.removeFloors(fileCallerDirectory, parentFoldersCount);
        }

        const relativeFileDirectory: string = Path.relative(process.cwd(), fileCallerDirectory);

        const relativeDirectory: string = this
            .convertPathSeparator(`${relativeRootDirectory}/${relativeFileDirectory}`);


        let absoluteDirectory: string = Path.resolve(relativeFileDirectory);

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
            if (existsSync(absolutePath4Test)) {
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
