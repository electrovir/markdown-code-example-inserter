import {existsSync} from 'fs-extra';
import {dirname, resolve} from 'path';
import {CodeExampleFileMissingError} from '../errors/code-example-file-missing.error';
import {CodeExampleLink} from '../parsing-markdown/extract-links';

export function extractExamplePaths(
    originalMarkdownFilePath: string,
    linkComments: CodeExampleLink[],
): string[] {
    return linkComments.map((linkComment) => {
        const codeExamplePath = resolve(dirname(originalMarkdownFilePath), linkComment.linkPath);
        if (!existsSync(codeExamplePath)) {
            throw new CodeExampleFileMissingError(codeExamplePath, originalMarkdownFilePath);
        }
        return resolve(dirname(originalMarkdownFilePath), linkComment.linkPath);
    });
}

export function extractExampleCode() {}

// noSourceCodeFiles.withLinkPaths;
