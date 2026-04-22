import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {CodeExampleFileMissingError} from '../errors/code-example-file-missing.error.js';
import {type CodeExampleLink} from '../parsing-markdown/extract-links.js';
import {noSourceCodeFiles} from '../repo-paths.js';
import {extractExamplePath} from './extract-example.js';

describe(extractExamplePath.name, () => {
    it('correctly checks links relative to the given markdown file', () => {
        const paths = extractExamplePath(noSourceCodeFiles.linkPaths, {
            linkPath: 'comment.md',
        } as CodeExampleLink);

        assert.strictEquals(paths, noSourceCodeFiles.comment);
    });

    it('correctly checks links relative to the given markdown file 2', () => {
        const paths = extractExamplePath(noSourceCodeFiles.linkPaths, {
            linkPath: 'invalid-link-comments.md',
        } as CodeExampleLink);

        assert.strictEquals(paths, noSourceCodeFiles.invalidLinkComments);
    });

    it('errors when files are missing', () => {
        assert.throws(
            () => {
                extractExamplePath(noSourceCodeFiles.linkPaths, {
                    linkPath: 'this-does-not-exist',
                } as CodeExampleLink);
            },
            {
                matchConstructor: CodeExampleFileMissingError,
            },
        );
    });
});
