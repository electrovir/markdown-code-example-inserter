import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {CodeExampleFileMissingError} from '../errors/code-example-file-missing.error.js';
import {type CodeExampleLink} from '../parsing-markdown/extract-links.js';

export function extractExamplePath(
    originalMarkdownFilePath: string,
    linkComment: CodeExampleLink,
): string {
    const codeExamplePath = resolve(dirname(originalMarkdownFilePath), linkComment.linkPath);
    if (!existsSync(codeExamplePath)) {
        throw new CodeExampleFileMissingError(codeExamplePath, originalMarkdownFilePath);
    }

    return codeExamplePath;
}

export async function extractExampleCode(
    originalMarkdownFilePath: string,
    linkComment: CodeExampleLink,
) {
    const exampleCodePath = extractExamplePath(originalMarkdownFilePath, linkComment);
    return await readFile(exampleCodePath);
}
