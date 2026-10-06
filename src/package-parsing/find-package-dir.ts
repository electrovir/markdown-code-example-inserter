import {findAncestor} from '@augment-vir/node';
import {dirname, relative, resolve} from 'node:path';
import {readPackageDetails} from './parse-package-json.js';

/**
 * Finds the closest directory to `filePath` that has a named `package.json`, without leaving
 * `rootDir`. This lets a monorepo's root markdown file treat each example as part of the workspace
 * package that contains it. Falls back to `rootDir`.
 */
export async function findPackageDir({
    filePath,
    rootDir,
}: Readonly<{
    filePath: string;
    rootDir: string;
}>) {
    /** `findAncestor` never reaches the system root from a relative path, so it must be absolute. */
    const packageDir = await findAncestor(resolve(dirname(filePath)), async (dir) => {
        return (
            relative(rootDir, dir).startsWith('..') || !!(await readPackageDetails(dir)).packageName
        );
    });

    return !packageDir || relative(rootDir, packageDir).startsWith('..') ? rootDir : packageDir;
}
