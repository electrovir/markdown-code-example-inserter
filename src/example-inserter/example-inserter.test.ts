import {assert, expect} from 'chai';
import {readFile} from 'fs-extra';
import {fullPackageExampleDir, fullPackageExampleFiles} from '../repo-paths';
import {insertAllExamples, isCodeUpdated} from './example-inserter';

describe(insertAllExamples.name, () => {
    it('should inserts examples into markdown file with no code blocks', async () => {
        const codeInsertedMarkdown = await insertAllExamples(
            fullPackageExampleFiles.readme,
            fullPackageExampleDir,
            undefined,
        );

        const expectation = (await readFile(fullPackageExampleFiles.readmeExpectation)).toString();

        expect(codeInsertedMarkdown).to.equal(expectation);
    });
});

describe(isCodeUpdated.name, () => {
    it('should read out of date markdown as outdated', async () => {
        const updated = await isCodeUpdated(
            fullPackageExampleFiles.readme,
            fullPackageExampleDir,
            undefined,
        );

        assert.isFalse(updated);
    });

    it('should read updated markdown as updated', async () => {
        const updated = await isCodeUpdated(
            fullPackageExampleFiles.readmeExpectation,
            fullPackageExampleDir,
            undefined,
        );

        assert.isTrue(updated);
    });
});
