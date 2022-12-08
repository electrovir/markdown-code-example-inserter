import {expect} from 'chai';
import {join} from 'path';
import {fullPackageExampleDir, noSourceCodeDir} from '../repo-paths';
import {readPackageDetails} from './parse-package-json';

describe(readPackageDetails.name, () => {
    it('reads package json details', async () => {
        const packageDetails = await readPackageDetails(fullPackageExampleDir);

        expect(packageDetails).to.deep.equal({
            packageName: 'full-package-example',
            mainPath: join(fullPackageExampleDir, 'dist', 'index.js'),
        });
    });

    it('returns empty properties when no package.json', async () => {
        const packageDetails = await readPackageDetails(noSourceCodeDir);

        expect(packageDetails).to.deep.equal({
            packageName: undefined,
            mainPath: undefined,
        });
    });
});
