import {extendingTsConfigDir, extendingTsConfigFiles, noSourceCodeDir} from '../repo-paths';
import {getTsDirs} from './parse-tsconfig';

describe(getTsDirs.name, () => {
    it('reads tsconfig options that are extended', () => {
        const tsConfigDetails = getTsDirs(extendingTsConfigDir);

        expect(tsConfigDetails).toEqual({
            source: extendingTsConfigFiles.sourceDir,
            output: extendingTsConfigFiles.distDir,
        });
    });

    it('reads undefined when no tsconfig exists in the given directory', () => {
        const tsConfigDetails = getTsDirs(noSourceCodeDir);

        expect(tsConfigDetails).toBeUndefined();
    });
});
