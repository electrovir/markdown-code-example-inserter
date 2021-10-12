import {readFile} from 'fs-extra';
import {testGroup} from 'test-vir';
import {fullPackageExampleDir, fullPackageExampleFiles} from '../repo-paths';
import {insertAllExamples, isCodeUpdated} from './example-inserter';

testGroup({
    description: insertAllExamples.name,
    tests: async (runTest) => {
        runTest({
            expect: (await readFile(fullPackageExampleFiles.readmeExpectation)).toString(),
            description: 'correctly inserts examples into markdown file with no code blocks',
            test: async () => {
                const codeInsertedMarkdown = await insertAllExamples(
                    fullPackageExampleFiles.readme,
                    fullPackageExampleDir,
                    undefined,
                );

                return codeInsertedMarkdown;
            },
        });
    },
});

testGroup({
    description: isCodeUpdated.name,
    tests: async (runTest) => {
        runTest({
            expect: false,
            description: 'correctly reads out of date markdown as outdated',
            test: async () => {
                const updated = await isCodeUpdated(
                    fullPackageExampleFiles.readme,
                    fullPackageExampleDir,
                    undefined,
                );

                return updated;
            },
        });

        runTest({
            expect: true,
            description: 'correctly reads updated markdown as updated',
            test: async () => {
                const updated = await isCodeUpdated(
                    fullPackageExampleFiles.readmeExpectation,
                    fullPackageExampleDir,
                    undefined,
                );

                return updated;
            },
        });
    },
});
