import {readFile} from 'fs-extra';
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
    const markdownContents = (await readFile(markdownPath)).toString();
    let markdownLines: Readonly<string[]> = markdownContents.split('\n');

    const linkComments = extractLinks(markdownContents);

    console.log(JSON.stringify(linkComments, null, 4));

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
            const fixedCode = await fixPackageImports(
                originalCode,
                join(packageDir, linkComment.linkPath),
                packageDir,
                forceIndexPath,
            );
            const language = getFileLanguageName(linkComment.linkPath);
            markdownLines = insertCodeExample(markdownLines, language, fixedCode, linkComment);
            // insert fixed code into markdown code with language name
        }, Promise.resolve());

    return markdownLines.join('\n');
}
