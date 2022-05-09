import {CodeExampleFileMissingError} from '../errors/code-example-file-missing.error';
import {CodeExampleLink} from '../parsing-markdown/extract-links';
import {noSourceCodeFiles} from '../repo-paths';
import {extractExamplePath} from './extract-example';

describe(extractExamplePath.name, () => {
    it('correctly checks links relative to the given markdown file', () => {
        const paths = extractExamplePath(noSourceCodeFiles.linkPaths, {
            linkPath: 'comment.md',
        } as CodeExampleLink);

        expect(paths).toBe(noSourceCodeFiles.comment);
    });

    it('correctly checks links relative to the given markdown file 2', () => {
        const paths = extractExamplePath(noSourceCodeFiles.linkPaths, {
            linkPath: 'invalid-link-comments.md',
        } as CodeExampleLink);

        expect(paths).toBe(noSourceCodeFiles.invalidLinkComments);
    });

    it('errors when files are missing', () => {
        expect(() => {
            extractExamplePath(noSourceCodeFiles.linkPaths, {
                linkPath: 'this-does-not-exist',
            } as CodeExampleLink);
        }).toThrow(CodeExampleFileMissingError);
    });
});
