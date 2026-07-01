import {MarkdownCodeExampleInserterError} from './markdown-code-example-inserter.error.js';

/**
 * Indicates that an example link file does not exist.
 *
 * @category Errors
 */
export class CodeExampleFileMissingError extends MarkdownCodeExampleInserterError {
    public override name = 'CodeExampleFileMissingError';
    constructor({missingFilePath, source}: Readonly<{missingFilePath: string; source: string}>) {
        super(
            `Can't find code example file '${missingFilePath}' which was referenced in '${source}'`,
        );
    }
}
