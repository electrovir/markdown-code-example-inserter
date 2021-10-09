import {testGroup} from 'test-vir';
import {CodeExampleFileMissingError} from '../errors/code-example-file-missing.error';
import {CodeExampleLink} from '../parsing-markdown/extract-links';
import {noSourceCodeFiles} from '../repo-paths';
import {extractExamplePaths} from './extract-examples';

testGroup({
    description: extractExamplePaths.name,
    tests: (runTest) => {
        const relativePaths = ['comment.md', 'invalid-link-comments.md'];

        runTest({
            expect: [noSourceCodeFiles.withComment, noSourceCodeFiles.withInvalidLinkComments],
            description: 'correctly checks links relative to the given markdown file',
            test: async () => {
                const paths = extractExamplePaths(
                    noSourceCodeFiles.withLinkPaths,
                    relativePaths.map((linkPath) => {
                        return {linkPath} as CodeExampleLink;
                    }),
                );

                return paths;
            },
        });

        runTest({
            expectError: {
                errorClass: CodeExampleFileMissingError,
            },
            description: 'errors when files are missing',
            test: async () => {
                const paths = extractExamplePaths(
                    noSourceCodeFiles.withLinkPaths,
                    ['this', 'does', 'not', 'exist'].map((linkPath) => {
                        return {linkPath} as CodeExampleLink;
                    }),
                );

                return paths;
            },
        });
    },
});
