import {testGroup} from 'test-vir';
import {CodeExampleLink} from '../parsing-markdown/extract-links';
import {insertCodeExample, insertText, replaceTextRange} from './insert-code';

testGroup({
    description: replaceTextRange.name,
    tests: (runTest) => {
        runTest({
            expect: 'a b insertion e',
            description: 'replaces range within the given string',
            test: () => {
                const replacedLines = replaceTextRange('a b c d e', [4, 7], 'insertion');

                return replacedLines;
            },
        });

        runTest({
            expect: 'insertion d e',
            description: 'replaces at the beginning of the string',
            test: () => {
                const replacedLines = replaceTextRange('a b c d e', [0, 5], 'insertion');

                return replacedLines;
            },
        });

        runTest({
            expect: 'a b c d insertion',
            description: 'replaces at the end of the string',
            test: () => {
                const replacedLines = replaceTextRange('a b c d e', [8, 9], 'insertion');

                return replacedLines;
            },
        });
    },
});

testGroup({
    description: insertText.name,
    tests: (runTest) => {
        runTest({
            expect: 'a b c d insertion e',
            description: 'inserts into the middle of a string',
            test: () => {
                const replacedLines = insertText('a b c d e', 8, 'insertion ');

                return replacedLines;
            },
        });

        runTest({
            expect: 'insertion a b c d e',
            description: 'inserts after the beginning of a string',
            test: () => {
                const replacedLines = insertText('a b c d e', 0, 'insertion ');

                return replacedLines;
            },
        });

        runTest({
            expect: 'a b c d e insertion',
            description: 'inserts at the end of a string',
            test: () => {
                const replacedLines = insertText('a b c d e', 9, ' insertion');

                return replacedLines;
            },
        });
    },
});

testGroup({
    description: insertCodeExample.name,
    tests: (runTest) => {
        runTest({
            expect: "a\n\nlinked comment here\n\n```TypeScript\nconsole.info('derp');\n```\n\nc\n\nd\n\ne",
            description: 'inserts code without a linked code block',
            test: () => {
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
                    } as Readonly<CodeExampleLink>,
                );

                return replacedLines;
            },
        });

        runTest({
            expect: "a\n\nlinked comment here\n\n```TypeScript\nconsole.info('derp');\n```\n\nb\n\nc",
            description: 'replaces code block when its present after the linked comment',
            test: () => {
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
                    } as Readonly<CodeExampleLink>,
                );

                return replacedLines;
            },
        });
    },
});
