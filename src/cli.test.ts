import {readFile, writeFile} from 'fs-extra';
import {join} from 'path';
import {testGroup} from 'test-vir';
import {cli, parseArgs} from './cli';
import {MarkdownCodeExampleInserterError} from './errors/markdown-code-example-inserter.error';
import {OutOfDateInsertedCodeError} from './errors/out-of-date-inserted-code.error';
import {fullPackageExampleDir, fullPackageExampleFiles} from './repo-paths';

testGroup({
    description: parseArgs.name,
    tests: (runTest) => {
        runTest({
            expect: [],
            description: 'no inputs results in no file paths',
            test: async () => {
                const paths = (await parseArgs([])).files;
                return paths;
            },
        });

        runTest({
            expect: [
                'README.md',
                join('test-repos', 'full-package-example', 'README.expect.md'),
                join('test-repos', 'full-package-example', 'README.md'),
                join('test-repos', 'no-source-code', 'comment.md'),
                join('test-repos', 'no-source-code', 'invalid-link-comments.md'),
                join('test-repos', 'no-source-code', 'link-paths.md'),
                join('test-repos', 'no-source-code', 'link-with-code.md'),
            ],
            description: 'gets all .md files and ignore node_modules',
            test: async () => {
                const paths = (await parseArgs(['./**/*.md'])).files;
                return paths;
            },
        });

        runTest({
            expect: ['README.md'],
            description: 'respects ignore list',
            test: async () => {
                const paths = (await parseArgs(['./**/*.md', '--ignore', './test-repos/**/*']))
                    .files;
                return paths;
            },
        });

        runTest({
            expect: ['README.md'],
            description: 'works with raw file names',
            test: async () => {
                const paths = (await parseArgs(['README.md'])).files;
                return paths;
            },
        });

        runTest({
            expect: ['README.md'],
            description: 'works with simple glob',
            test: async () => {
                const paths = (await parseArgs(['./*.md'])).files;
                return paths;
            },
        });
    },
});

testGroup({
    description: cli.name,
    tests: async (runTest) => {
        runTest({
            expect: (await readFile(fullPackageExampleFiles.readmeExpectation)).toString(),
            description: 'cli works correctly on readme file',
            test: async () => {
                const originalFileContents = (
                    await readFile(fullPackageExampleFiles.readme)
                ).toString();
                try {
                    await cli([fullPackageExampleFiles.readme, '--silent'], fullPackageExampleDir);
                    const newFileContents = (
                        await readFile(fullPackageExampleFiles.readme)
                    ).toString();
                    return newFileContents;
                } finally {
                    await writeFile(fullPackageExampleFiles.readme, originalFileContents);
                }
            },
        });

        runTest({
            expect: (await readFile(fullPackageExampleFiles.readmeExpectation)).toString(),
            description: "cli --check doesn't update the markdown files",
            test: async () => {
                const originalFileContents = (
                    await readFile(fullPackageExampleFiles.readmeExpectation)
                ).toString();
                try {
                    await cli(
                        [fullPackageExampleFiles.readmeExpectation, '--silent', '--check'],
                        fullPackageExampleDir,
                    );
                    const newFileContents = (
                        await readFile(fullPackageExampleFiles.readmeExpectation)
                    ).toString();
                    return newFileContents;
                } finally {
                    if (
                        (await readFile(fullPackageExampleFiles.readmeExpectation)).toString() !==
                        originalFileContents
                    ) {
                        await writeFile(
                            fullPackageExampleFiles.readmeExpectation,
                            originalFileContents,
                        );
                    }
                }
            },
        });

        runTest({
            expectError: {
                errorClass: OutOfDateInsertedCodeError,
            },
            description: 'cli --check errors when not update to date',
            test: async () => {
                await cli(
                    [fullPackageExampleFiles.readme, '--silent', '--check'],
                    fullPackageExampleDir,
                );
            },
        });

        runTest({
            description: 'cli --check does not error when code is up to date',
            test: async () => {
                await cli(
                    [fullPackageExampleFiles.readmeExpectation, '--silent', '--check'],
                    fullPackageExampleDir,
                );
            },
        });

        runTest({
            expectError: {
                errorClass: MarkdownCodeExampleInserterError,
            },
            description: 'cli errors when no arguments are given',
            test: async () => {
                await cli([], fullPackageExampleDir);
            },
        });
    },
});
