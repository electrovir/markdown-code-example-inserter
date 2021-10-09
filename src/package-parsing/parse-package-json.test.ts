import {testGroup} from 'test-vir';
import {fullPackageExampleDir, noSourceCodeDir} from '../repo-paths';
import {readPackageDetails} from './parse-package-json';

testGroup({
    description: readPackageDetails.name,
    tests: (runTest) => {
        runTest({
            expect: {
                packageName: 'full-package-example',
                mainPath: 'dist/index.js',
            },
            description: 'reads package json details',
            test: async () => {
                const packageDetails = readPackageDetails(fullPackageExampleDir);

                return packageDetails;
            },
        });

        runTest({
            expect: {
                mainPath: undefined,
                packageName: undefined,
            },
            description: 'returns empty properties when no package.json',
            test: async () => {
                const packageDetails = readPackageDetails(noSourceCodeDir);

                return packageDetails;
            },
        });
    },
});
