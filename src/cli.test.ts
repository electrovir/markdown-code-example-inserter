import {readFile, writeFile} from 'fs-extra';
import {join} from 'path';
import {cli, parseArgs} from './cli';
import {MarkdownCodeExampleInserterError} from './errors/markdown-code-example-inserter.error';
import {OutOfDateInsertedCodeError} from './errors/out-of-date-inserted-code.error';
import {fullPackageExampleDir, fullPackageExampleFiles} from './repo-paths';

describe(parseArgs.name, () => {
    it('no inputs results in no file paths', async () => {
        const paths = (await parseArgs([])).files;
        expect(paths).toEqual([]);
    });

    it('gets all .md files and ignore node_modules', async () => {
        const paths = (await parseArgs(['./**/*.md'])).files;
        expect(paths).toEqual([
            'README.md',
            join('test-repos', 'full-package-example', 'README.expect.md'),
            join('test-repos', 'full-package-example', 'README.md'),
            join('test-repos', 'no-source-code', 'comment.md'),
            join('test-repos', 'no-source-code', 'invalid-link-comments.md'),
            join('test-repos', 'no-source-code', 'link-paths.md'),
            join('test-repos', 'no-source-code', 'link-with-code.md'),
        ]);
    });

    it('respects ignore list', async () => {
        const paths = (
            await parseArgs([
                './**/*.md',
                '--ignore',
                './test-repos/**/*',
            ])
        ).files;
        expect(paths).toEqual(['README.md']);
    });

    it('works with raw file names', async () => {
        const paths = (await parseArgs(['README.md'])).files;
        expect(paths).toEqual(['README.md']);
    });

    it('works with simple glob', async () => {
        const paths = (await parseArgs(['./*.md'])).files;
        expect(paths).toEqual(['README.md']);
    });
});

describe(cli.name, () => {
    it('cli works correctly on readme file', async () => {
        const originalFileContents = (await readFile(fullPackageExampleFiles.readme)).toString();
        try {
            await cli(
                [
                    fullPackageExampleFiles.readme,
                    '--silent',
                ],
                fullPackageExampleDir,
            );
            const newFileContents = (await readFile(fullPackageExampleFiles.readme)).toString();
            expect(newFileContents).toBe(
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
            await cli(
                [
                    fullPackageExampleFiles.readmeExpectation,
                    '--silent',
                    '--check',
                ],
                fullPackageExampleDir,
            );
            const newFileContents = (
                await readFile(fullPackageExampleFiles.readmeExpectation)
            ).toString();
            expect(newFileContents).toBe(
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
        await expect(() =>
            cli(
                [
                    fullPackageExampleFiles.readme,
                    '--silent',
                    '--check',
                ],
                fullPackageExampleDir,
            ),
        ).rejects.toThrow(OutOfDateInsertedCodeError);
    });

    it('cli --check does not error when code is up to date', async () => {
        cli(
            [
                fullPackageExampleFiles.readmeExpectation,
                '--silent',
                '--check',
            ],
            fullPackageExampleDir,
        );
    });

    it('cli errors when no arguments are given', async () => {
        await expect(() => cli([], fullPackageExampleDir)).rejects.toThrow(
            MarkdownCodeExampleInserterError,
        );
    });
});
