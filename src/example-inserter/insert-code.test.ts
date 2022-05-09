import {CodeExampleLink} from '../parsing-markdown/extract-links';
import {insertCodeExample, insertText, replaceTextRange} from './insert-code';

describe(replaceTextRange.name, () => {
    it('replaces range within the given string', () => {
        const replacedLines = replaceTextRange(
            'a b c d e',
            [
                4,
                7,
            ],
            'insertion',
        );

        expect(replacedLines).toBe('a b insertion e');
    });

    it('replaces at the beginning of the string', () => {
        const replacedLines = replaceTextRange(
            'a b c d e',
            [
                0,
                5,
            ],
            'insertion',
        );

        expect(replacedLines).toBe('insertion d e');
    });

    it('replaces at the end of the string', () => {
        const replacedLines = replaceTextRange(
            'a b c d e',
            [
                8,
                9,
            ],
            'insertion',
        );

        expect(replacedLines).toBe('a b c d insertion');
    });
});

describe(insertText.name, () => {
    it('inserts into the middle of a string', () => {
        const replacedLines = insertText('a b c d e', 8, 'insertion ');

        expect(replacedLines).toBe('a b c d insertion e');
    });

    it('inserts after the beginning of a string', () => {
        const replacedLines = insertText('a b c d e', 0, 'insertion ');

        expect(replacedLines).toBe('insertion a b c d e');
    });

    it('inserts at the end of a string', () => {
        const replacedLines = insertText('a b c d e', 9, ' insertion');

        expect(replacedLines).toBe('a b c d e insertion');
    });
});

describe(insertCodeExample.name, () => {
    it('inserts code without a linked code block', () => {
        const replacedLines = insertCodeExample(
            'a\n\nlinked comment here\n\nc\n\nd\n\ne',
            'TypeScript',
            "console.info('derp');",
            {
                node: {
                    position: {
                        start: {offset: 3},
                        end: {offset: 3 + 'linked comment here'.length},
                    },
                },
                indent: '',
            } as Readonly<CodeExampleLink>,
        );

        expect(replacedLines).toBe(
            "a\n\nlinked comment here\n\n```TypeScript\nconsole.info('derp');\n```\n\nc\n\nd\n\ne",
        );
    });

    it('replaces code block when its present after the linked comment', () => {
        const replacedLines = insertCodeExample(
            'a\n\nlinked comment here\n\ncode block here\n\ncode block still here\n\nb\n\nc',
            'TypeScript',
            "console.info('derp');",
            {
                node: {
                    position: {
                        start: {offset: 3},
                        end: {offset: 22},
                    },
                },
                linkedCodeBlock: {
                    position: {
                        start: {offset: 24},
                        end: {offset: 62},
                    },
                },
                indent: '',
            } as Readonly<CodeExampleLink>,
        );

        expect(replacedLines).toBe(
            "a\n\nlinked comment here\n\n```TypeScript\nconsole.info('derp');\n```\n\nb\n\nc",
        );
    });
});
