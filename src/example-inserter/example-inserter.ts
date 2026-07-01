import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {extractLinks} from '../parsing-markdown/extract-links.js';
import {fixCodeIndents} from './code-indent.js';
import {extractExampleCode} from './extract-example.js';
import {fixPackageImports} from './fix-package-imports.js';
import {getFileLanguageName} from './get-file-language-name.js';
import {insertCodeExample} from './insert-code.js';

/**
 * Create a new string from the given markdown file with all code example links inserted.
 *
 * @category Internals
 */
export async function generateAllExamples({
    markdownPath,
    packageDir,
    forceIndexPath,
}: Readonly<{
    markdownPath: string;
    packageDir: string;
    forceIndexPath: string | undefined;
}>): Promise<string> {
    let markdownContents = (await readFile(markdownPath)).toString();

    await extractLinks(markdownContents)
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
            const importFixedCode = await fixPackageImports({
                codeExample: originalCode,
                codePath: join(packageDir, linkComment.linkPath),
                packageDir,
                forceIndexPath,
                language,
            });
            const indentFixedCode = fixCodeIndents({
                rawCode: importFixedCode,
                indent: linkComment.indent,
            });
            markdownContents = insertCodeExample({
                markdownText: markdownContents,
                language,
                fixedCode: indentFixedCode,
                linkComment,
            });
        }, Promise.resolve());

    return markdownContents;
}

/**
 * Check if the given markdown file has all code examples updated.
 *
 * @category Main
 */
export async function isCodeUpdated({
    markdownPath,
    packageDir,
    forceIndexPath,
}: Readonly<{
    markdownPath: string;
    packageDir: string;
    forceIndexPath: string | undefined;
}>): Promise<boolean> {
    const oldText = (await readFile(markdownPath)).toString();
    const newText = await generateAllExamples({
        markdownPath,
        packageDir,
        forceIndexPath,
    });

    return oldText === newText;
}

/**
 * Overwrite the given markdown file with all code examples updated.
 *
 * @category Main
 */
export async function writeAllExamples({
    markdownPath,
    packageDir,
    forceIndexPath,
}: Readonly<{markdownPath: string; packageDir: string; forceIndexPath: string | undefined}>) {
    const newText = await generateAllExamples({
        markdownPath,
        packageDir,
        forceIndexPath,
    });
    await writeFile(markdownPath, newText);
}
