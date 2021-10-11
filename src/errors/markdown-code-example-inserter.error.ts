/** Base error class for all errors throw by this package. */
export class MarkdownCodeExampleInserterError extends Error {
    public override name = 'MarkdownCodeExampleInserterError';
    constructor(message: string) {
        super(message);
    }
}
