import {readFile, writeFile} from 'fs-extra';
import {join} from 'path';
import {extractLinks} from '../parsing-markdown/extract-links';
import {extractExampleCode} from './extract-example';
import {fixPackageImports} from './fix-package-imports';
import {getFileLanguageName} from './get-file-language-name';
import {insertCodeExample} from './insert-code';

export async function insertAllExamples(
    markdownPath: string,
    packageDir: string,
    forceIndexPath: string | undefined,
): Promise<string> {
    let markdownContents = (await readFile(markdownPath)).toString();

    const linkComments = extractLinks(markdownContents);

    await linkComments
        .sort((a, b) => a.node.position.end.offset - b.node.position.end.offset)
        /**
         * Reverse the array so that we're working from the bottom of the file upwards so we don't
         * mess up line numbers for other comments.
         */
        .reverse()
        .reduce(async (lastPromise, linkComment) => {
            await lastPromise;
            const originalCode = (await extractExampleCode(markdownPath, linkComment)).toString();
            const language = getFileLanguageName(linkComment.linkPath);
            const fixedCode = await fixPackageImports(
                originalCode,
                join(packageDir, linkComment.linkPath),
                packageDir,
                language,
                forceIndexPath,
            );
            markdownContents = insertCodeExample(
                markdownContents,
                language,
                fixedCode,
                linkComment,
            );
        }, Promise.resolve());

    return markdownContents;
}

export async function isCodeUpdated(
    markdownPath: string,
    packageDir: string,
    forceIndexPath: string | undefined,
): Promise<boolean> {
    const oldText = (await readFile(markdownPath)).toString();
    const newText = await insertAllExamples(markdownPath, packageDir, forceIndexPath);

    return oldText === newText;
}

export async function writeAllExamples(
    markdownPath: string,
    packageDir: string,
    forceIndexPath: string | undefined,
) {
    const newText = await insertAllExamples(markdownPath, packageDir, forceIndexPath);
    await writeFile(markdownPath, newText);
}
