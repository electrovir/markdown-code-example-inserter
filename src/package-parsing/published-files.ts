import {assertWrap} from '@augment-vir/assert';
import {runShellCommand} from '@augment-vir/node';
import {join} from 'node:path';

const publishedFilesCache = new Map<string, Promise<string[]>>();

/**
 * Absolute paths of every file that `npm publish` would include for the package in `packageDir`, as
 * reported by npm itself so that `.npmignore`, `files`, and npm's defaults all apply. Resolves to
 * an empty array when npm cannot pack the package (such as when its `package.json` has no
 * `version`).
 */
export async function readPublishedFiles(packageDir: string) {
    const cached = publishedFilesCache.get(packageDir);
    if (cached) {
        return await cached;
    }

    const publishedFiles = packPublishedFiles(packageDir);
    publishedFilesCache.set(packageDir, publishedFiles);
    return await publishedFiles;
}

type PackResult = {
    files: {
        path: string;
    }[];
};

async function packPublishedFiles(packageDir: string) {
    const output = await runShellCommand('npm pack --dry-run --json --ignore-scripts', {
        cwd: packageDir,
    });

    if (output.exitCode) {
        return [];
    }

    /** Npm 12 keys the results by package name. Older npm versions output an array. */
    const packResults: Readonly<Record<string, PackResult>> | ReadonlyArray<PackResult> =
        JSON.parse(output.stdout);

    return assertWrap
        .isDefined(Object.values(packResults)[0])
        .files.map((file) => join(packageDir, file.path));
}
