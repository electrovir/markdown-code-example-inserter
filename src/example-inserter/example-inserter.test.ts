import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {readFile} from 'node:fs/promises';
import {fullPackageExampleDir, fullPackageExampleFiles} from '../repo-paths.js';
import {generateAllExamples, isCodeUpdated} from './example-inserter.js';

describe(generateAllExamples.name, () => {
    it('inserts examples into markdown file with no code blocks', async () => {
        const codeInsertedMarkdown = await generateAllExamples({
            markdownPath: fullPackageExampleFiles.readme,
            packageDir: fullPackageExampleDir,
            forceIndexPath: undefined,
        });

        const expectation = (await readFile(fullPackageExampleFiles.readmeExpectation)).toString();

        assert.strictEquals(codeInsertedMarkdown, expectation);
    });
});

describe(isCodeUpdated.name, () => {
    it('reads out of date markdown as outdated', async () => {
        const updated = await isCodeUpdated({
            markdownPath: fullPackageExampleFiles.readme,
            packageDir: fullPackageExampleDir,
            forceIndexPath: undefined,
        });

        assert.strictEquals(updated, false);
    });

    it('reads updated markdown as updated', async () => {
        const updated = await isCodeUpdated({
            markdownPath: fullPackageExampleFiles.readmeExpectation,
            packageDir: fullPackageExampleDir,
            forceIndexPath: undefined,
        });

        assert.strictEquals(updated, true);
    });
});
