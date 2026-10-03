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

async function packPublishedFiles(packageDir: string) {
    const output = await runShellCommand('npm pack --dry-run --json --ignore-scripts', {
        cwd: packageDir,
    });

    if (output.exitCode) {
        return [];
    }

    const packResults: [
        {
            files: {
                path: string;
            }[];
        },
    ] = JSON.parse(output.stdout);

    return packResults[0].files.map((file) => join(packageDir, file.path));
}
