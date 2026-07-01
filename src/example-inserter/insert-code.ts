import {type CodeExampleLink} from '../parsing-markdown/extract-links.js';
import {type LanguageName} from './language-map.js';

const markdownCodeBlockWrapper = '```';

export function insertCodeExample({
    markdownText,
    language,
    fixedCode,
    linkComment,
}: Readonly<{
    markdownText: string;
    language: LanguageName | undefined;
    fixedCode: string;
    linkComment: Readonly<CodeExampleLink>;
}>): string {
    const markdownCodeBlock = `${linkComment.indent}${markdownCodeBlockWrapper}${
        language ?? ''
    }\n${fixedCode}\n${linkComment.indent}${markdownCodeBlockWrapper}`;

    if (linkComment.linkedCodeBlock) {
        return replaceTextRange({
            text: markdownText,
            range: [
                linkComment.linkedCodeBlock.position.start.offset - linkComment.indent.length,
                linkComment.linkedCodeBlock.position.end.offset,
            ],
            insertion: markdownCodeBlock,
        });
    } else {
        return insertText({
            text: markdownText,
            insertAtThisIndex: linkComment.node.position.end.offset,
            insertion: `\n\n${markdownCodeBlock}`,
        });
    }
}

export function insertText({
    text,
    insertAtThisIndex,
    insertion,
}: Readonly<{text: string; insertAtThisIndex: number; insertion: string}>): string {
    return replaceTextRange({
        text,
        range: [
            insertAtThisIndex,
            insertAtThisIndex,
        ],
        insertion,
    });
}

export function replaceTextRange({
    text,
    range,
    insertion,
}: Readonly<{
    text: string;
    range: Readonly<
        [
            number,
            number,
        ]
    >;
    insertion: string;
}>): string {
    return text.slice(0, range[0]) + insertion + text.slice(range[1]);
}
