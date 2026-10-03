import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {extendingTsConfigDir, extendingTsConfigFiles, noSourceCodeDir} from '../repo-paths.mock.js';
import {getTsDirs} from './parse-tsconfig.js';

describe(getTsDirs.name, () => {
    it('reads tsconfig options that are extended', () => {
        const tsConfigDetails = getTsDirs(extendingTsConfigDir);

        assert.deepEquals(tsConfigDetails, {
            source: extendingTsConfigFiles.sourceDir,
            output: extendingTsConfigFiles.distDir,
        });
    });

    it('reads undefined when no tsconfig exists in the given directory', () => {
        const tsConfigDetails = getTsDirs(noSourceCodeDir);

        assert.strictEquals(tsConfigDetails, undefined);
    });
});
