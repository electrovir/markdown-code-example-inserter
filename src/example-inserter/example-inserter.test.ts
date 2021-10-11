import {readFile} from 'fs-extra';
import {testGroup} from 'test-vir';
import {fullPackageExampleDir, fullPackageExampleFiles} from '../repo-paths';
import {insertAllExamples} from './example-inserter';

testGroup({
    exclude: true,
    description: insertAllExamples.name,
    tests: async (runTest) => {
        runTest({
            expect: (
                await readFile(fullPackageExampleFiles.readmeNoCodeBlocksExpectation)
            ).toString(),
            description: 'correctly inserts examples into markdown file with no code blocks',
            test: async () => {
                const codeInsertedMarkdown = await insertAllExamples(
                    fullPackageExampleFiles.readmeNoCodeBlocks,
                    fullPackageExampleDir,
                    undefined,
                );

                return codeInsertedMarkdown;
            },
        });
    },
});
