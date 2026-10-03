import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {join} from 'node:path';
import {fullPackageExampleDir, noSourceCodeDir} from '../repo-paths.mock.js';
import {readPackageDetails} from './parse-package-json.js';

describe(readPackageDetails.name, () => {
    it('reads package json details', async () => {
        const packageDetails = await readPackageDetails(fullPackageExampleDir);

        assert.deepEquals(packageDetails, {
            packageName: 'full-package-example',
            mainPath: join(fullPackageExampleDir, 'dist', 'index.js'),
        });
    });

    it('returns empty properties when no package.json', async () => {
        const packageDetails = await readPackageDetails(noSourceCodeDir);

        assert.deepEquals(packageDetails, {
            packageName: undefined,
            mainPath: undefined,
        });
    });
});
