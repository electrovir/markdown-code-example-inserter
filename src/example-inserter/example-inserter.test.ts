import {readFile} from 'fs-extra';
import {testGroup} from 'test-vir';
import {fullPackageExampleDir, fullPackageExampleFiles} from '../repo-paths';
import {insertAllExamples} from './example-inserter';

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
