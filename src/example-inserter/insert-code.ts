import {CodeExampleLink} from '../parsing-markdown/extract-links';
import {LanguageName} from './get-file-language-name';

const markdownCodeBlockWrapper = '```';

export function insertCodeExample(
    lines: Readonly<string[]>,
    language: LanguageName | undefined,
    fixedCode: string,
    linkComment: Readonly<CodeExampleLink>,
): Readonly<string[]> {
    const markdownCodeBlock = `${markdownCodeBlockWrapper}${
        language ?? ''
    }\n${fixedCode}\n${markdownCodeBlockWrapper}`;

    if (linkComment.linkedCodeBlock) {
        return replaceLines(
            lines,
            [
                // line is 1 indexed
                linkComment.linkedCodeBlock.position.start.line,
                linkComment.linkedCodeBlock.position.end.line,
            ],
            markdownCodeBlock,
        );
    } else {
        return insertLine(
            lines,
            // normally this would need a +1 here but line is 1 indexes so it is not necessary
            linkComment.node.position.end.line - 1,
            markdownCodeBlock,
        );
    }
}

export function insertLine(
    lines: Readonly<string[]>,
    insertAtThisIndex: number,
    insertion: string,
): Readonly<string[]> {
    return [...lines.slice(0, insertAtThisIndex), insertion, ...lines.slice(insertAtThisIndex)];
}

export function replaceLines(
    lines: Readonly<string[]>,
    range: Readonly<[number, number]>,
    insert: string,
): Readonly<string[]> {
    const filteredIndexes = lines.filter((line, index) => {
        return index < range[0] || range[1] <= index;
    });

    filteredIndexes[range[0]] = insert;

    return filteredIndexes;
}
