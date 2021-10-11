import {readFile} from 'fs-extra';
import {join} from 'path';
import {guessPackageIndex} from '../package-parsing/package-index';
import {extractLinks} from '../parsing-markdown/extract-links';
import {extractExampleCode} from './extract-example';
import {fixPackageImports} from './fix-package-imports';
import {getFileLanguageName} from './get-file-language-name';

export async function insertAllExamples(
    markdownPath: string,
    packageDir: string,
    forceIndexPath: string | undefined,
): Promise<string> {
    const markdownFileContents = (await readFile(markdownPath)).toString();
    const markdownLines = markdownFileContents.split('\n');

    const linkComments = extractLinks(markdownFileContents);
    linkComments
        .sort((a, b) => {
            const lineDifference = a.node.position.end.line - b.node.position.end.line;

            if (lineDifference === 0) {
                return a.node.position.end.column - b.node.position.end.column;
            } else {
                return lineDifference;
            }
        })
        /**
         * Reverse the array so that we're working from the bottom of the file upwards so we don't
         * mess up line numbers for other comments.
         */
        .reverse()
        .reduce(async (lastPromise, linkComment) => {
            await lastPromise;
            const originalCode = (await extractExampleCode(markdownPath, linkComment)).toString();
            const packageIndex = await guessPackageIndex(packageDir);
            const fixedCode = await fixPackageImports(
                originalCode,
                join(packageDir, linkComment.linkPath),
                packageDir,
                forceIndexPath,
            );
            const language = getFileLanguageName(linkComment.linkPath);
            // insert fixed code into markdown code with language name
        }, Promise.resolve());

    return markdownFileContents;
}
