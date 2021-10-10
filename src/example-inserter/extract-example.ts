import {existsSync, readFile} from 'fs-extra';
import {dirname, resolve} from 'path';
import {CodeExampleFileMissingError} from '../errors/code-example-file-missing.error';
import {CodeExampleLink} from '../parsing-markdown/extract-links';

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
    const exampleCode = await readFile(exampleCodePath);

    return exampleCode;
}
