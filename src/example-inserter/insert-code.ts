import {CodeExampleLink} from '../parsing-markdown/extract-links';
import {LanguageName} from './get-file-language-name';

const markdownCodeBlockWrapper = '```';

export function insertCodeExample(
    markdownText: string,
    language: LanguageName | undefined,
    fixedCode: string,
    linkComment: Readonly<CodeExampleLink>,
): string {
    const markdownCodeBlock = `${linkComment.indent}${markdownCodeBlockWrapper}${
        language ?? ''
    }\n${fixedCode}\n${linkComment.indent}${markdownCodeBlockWrapper}`;

    if (linkComment.linkedCodeBlock) {
        return replaceTextRange(
            markdownText,
            [
                linkComment.linkedCodeBlock.position.start.offset - linkComment.indent.length,
                linkComment.linkedCodeBlock.position.end.offset,
            ],
            markdownCodeBlock,
        );
    } else {
        return insertText(
            markdownText,
            linkComment.node.position.end.offset,
            `\n\n${markdownCodeBlock}`,
        );
    }
}

export function insertText(text: string, insertAtThisIndex: number, insertion: string): string {
    return replaceTextRange(text, [insertAtThisIndex, insertAtThisIndex], insertion);
}

export function replaceTextRange(
    text: string,
    range: Readonly<[number, number]>,
    insertion: string,
): string {
    return text.slice(0, range[0]) + insertion + text.slice(range[1]);
}
