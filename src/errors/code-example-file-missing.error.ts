import {MarkdownCodeExampleInserterError} from './markdown-code-example-inserter.error';

export class CodeExampleFileMissingError extends MarkdownCodeExampleInserterError {
    public override name = 'CodeExampleFileMissingError';
    constructor(missingFilePath: string, source: string) {
        super(
            `Can't find code example file "${missingFilePath}" which was referenced in "${source}"`,
        );
    }
}
