import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {MarkdownCodeExampleInserterError} from '../errors/markdown-code-example-inserter.error.js';
import {OutOfDateInsertedCodeError} from '../errors/out-of-date-inserted-code.error.js';
import {fullPackageExampleDir, fullPackageExampleFiles} from '../repo-paths.js';
import {parseArgs, runCli} from './run-cli.js';

describe(parseArgs.name, () => {
    it('no inputs results in no file paths', async () => {
        const paths = (await parseArgs([], '')).files;
        assert.deepEquals(paths, []);
    });

    it('gets all .md files and ignores node_modules', async () => {
        const paths = (await parseArgs(['./**/*.md'], '')).files;
        assert.deepEquals(paths, [
            'README.md',
            join('test-files', 'forced-index-example', 'complete.md'),
            join('test-files', 'forced-index-example', 'incomplete.md'),
            join('test-files', 'full-package-example', 'README.expect.md'),
            join('test-files', 'full-package-example', 'README.md'),
            join('test-files', 'no-source-code', 'comment.md'),
            join('test-files', 'no-source-code', 'invalid-link-comments.md'),
            join('test-files', 'no-source-code', 'link-paths.md'),
            join('test-files', 'no-source-code', 'link-with-code.md'),
            'todo.md',
        ]);
    });

    it('respects ignore list', async () => {
        const paths = (
            await parseArgs(
                [
                    './**/*.md',
                    '--ignore',
                    './test-files/**/*',
                ],
                '',
            )
        ).files;
        assert.deepEquals(paths, [
            'README.md',
            'todo.md',
        ]);
    });

    it('works with raw file names', async () => {
        const paths = (await parseArgs(['README.md'], '')).files;
        assert.deepEquals(paths, ['README.md']);
    });

    it('works with simple glob', async () => {
        const paths = (await parseArgs(['./*.md'], '')).files;
        assert.deepEquals(paths, [
            'README.md',
            'todo.md',
        ]);
    });
});

describe(runCli.name, () => {
    it('cli works correctly on readme file', async () => {
        const originalFileContents = (await readFile(fullPackageExampleFiles.readme)).toString();
        try {
            await runCli({
                rawArgs: [
                    fullPackageExampleFiles.readme,
                    '--silent',
                ],
                cwd: fullPackageExampleDir,
            });
            const newFileContents = (await readFile(fullPackageExampleFiles.readme)).toString();
            assert.strictEquals(
                newFileContents,
                (await readFile(fullPackageExampleFiles.readmeExpectation)).toString(),
            );
        } finally {
            await writeFile(fullPackageExampleFiles.readme, originalFileContents);
        }
    });

    it("cli --check doesn't update the markdown files", async () => {
        const originalFileContents = (
            await readFile(fullPackageExampleFiles.readmeExpectation)
        ).toString();
        try {
            await runCli({
                rawArgs: [
                    fullPackageExampleFiles.readmeExpectation,
                    '--silent',
                    '--check',
                ],
                cwd: fullPackageExampleDir,
            });
            const newFileContents = (
                await readFile(fullPackageExampleFiles.readmeExpectation)
            ).toString();
            assert.strictEquals(
                newFileContents,
                (await readFile(fullPackageExampleFiles.readmeExpectation)).toString(),
            );
        } finally {
            if (
                (await readFile(fullPackageExampleFiles.readmeExpectation)).toString() !==
                originalFileContents
            ) {
                await writeFile(fullPackageExampleFiles.readmeExpectation, originalFileContents);
            }
        }
    });

    it('cli --check errors when not update to date', async () => {
        await assert.throws(
            () =>
                runCli({
                    rawArgs: [
                        fullPackageExampleFiles.readme,
                        '--silent',
                        '--check',
                    ],
                    cwd: fullPackageExampleDir,
                }),
            {
                matchConstructor: OutOfDateInsertedCodeError,
            },
        );
    });

    it('cli --check does not error when code is up to date', async () => {
        await runCli({
            rawArgs: [
                fullPackageExampleFiles.readmeExpectation,
                '--silent',
                '--check',
            ],
            cwd: fullPackageExampleDir,
        });
    });

    it('cli errors when no arguments are given', async () => {
        await assert.throws(
            () =>
                runCli({
                    rawArgs: [],
                    cwd: fullPackageExampleDir,
                }),
            {
                matchConstructor: MarkdownCodeExampleInserterError,
            },
        );
    });
});
