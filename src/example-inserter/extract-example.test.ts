import {testGroup} from 'test-vir';
import {CodeExampleFileMissingError} from '../errors/code-example-file-missing.error';
import {CodeExampleLink} from '../parsing-markdown/extract-links';
import {noSourceCodeFiles} from '../repo-paths';
import {extractExamplePath} from './extract-example';

testGroup({
    description: extractExamplePath.name,
    tests: (runTest) => {
        runTest({
            expect: noSourceCodeFiles.withComment,
            description: 'correctly checks links relative to the given markdown file',
            test: async () => {
                const paths = extractExamplePath(noSourceCodeFiles.withLinkPaths, {
                    linkPath: 'comment.md',
                } as CodeExampleLink);

                return paths;
            },
        });

        runTest({
            expect: noSourceCodeFiles.withInvalidLinkComments,
            description: 'correctly checks links relative to the given markdown file 2',
            test: async () => {
                const paths = extractExamplePath(noSourceCodeFiles.withLinkPaths, {
                    linkPath: 'invalid-link-comments.md',
                } as CodeExampleLink);

                return paths;
            },
        });

        runTest({
            expectError: {
                errorClass: CodeExampleFileMissingError,
            },
            description: 'errors when files are missing',
            test: async () => {
                const paths = extractExamplePath(noSourceCodeFiles.withLinkPaths, {
                    linkPath: 'this-does-not-exist',
                } as CodeExampleLink);

                return paths;
            },
        });
    },
});
