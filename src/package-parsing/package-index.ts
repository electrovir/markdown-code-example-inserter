import {join} from 'path';
import {ParsedCommandLine} from 'typescript';
import {readPackageDetails} from './parse-package-json';
import {getTsDirs} from './parse-tsconfig';

export type PackageIndex = {
    replaceName: string | undefined;
    indexPath: string;
};

export async function guessPackageIndex(
    packageDir: string,
    /** For testing purposes. */
    overrideTsConfig?: Partial<ParsedCommandLine>,
    /** For testing purposes. */
    overridePackageJson?: Record<string, string | undefined>,
): Promise<PackageIndex> {
    const tsConfigDirs = getTsDirs(packageDir, overrideTsConfig);
    const packageDetails = await readPackageDetails(packageDir, overridePackageJson);

    let indexPath = packageDetails.mainPath
        ? packageDetails.mainPath.replace(packageDir, '')
        : undefined;

    if (tsConfigDirs) {
        if (tsConfigDirs.output && indexPath != undefined) {
            indexPath = indexPath.replace(tsConfigDirs.output.replace(packageDir, ''), '');
        }
        if (tsConfigDirs.source) {
            if (indexPath == undefined) {
                indexPath = tsConfigDirs.source;
            } else {
                indexPath = join(
                    tsConfigDirs.source,
                    indexPath.replace(tsConfigDirs.source.replace(packageDir, ''), ''),
                );
            }
        }
        if (indexPath) {
            indexPath = indexPath.replace(/\.js$/, '.ts');
        }
    }

    if (indexPath && !indexPath.includes(packageDir)) {
        indexPath = join(packageDir, indexPath);
    }

    return {
        replaceName: packageDetails.packageName,
        indexPath: indexPath || packageDir,
    };
}
