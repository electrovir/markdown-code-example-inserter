import {MarkdownCodeExampleInserterError} from './markdown-code-example-inserter.error';

export class OutOfDateInsertedCodeError extends MarkdownCodeExampleInserterError {
    public override name = 'OutOfDateInsertedCodeError';
    constructor(message: string) {
        super(message);
    }
}
