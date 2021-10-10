import {testGroup} from 'test-vir';
import {extendingTsConfigDir, extendingTsConfigFiles, noSourceCodeDir} from '../repo-paths';
import {getTsDirs} from './parse-tsconfig';

testGroup({
    description: getTsDirs.name,
    tests: (runTest) => {
        runTest({
            expect: {
                source: extendingTsConfigFiles.sourceDir,
                output: extendingTsConfigFiles.distDir,
            },
            description: 'reads tsconfig options that are extended',
            test: async () => {
                const tsConfigDetails = getTsDirs(extendingTsConfigDir);

                return tsConfigDetails;
            },
        });

        runTest({
            expect: undefined,
            description: 'reads undefined when no tsconfig exists in the given directory',
            test: async () => {
                const tsConfigDetails = getTsDirs(noSourceCodeDir);

                return tsConfigDetails;
            },
        });
    },
});
