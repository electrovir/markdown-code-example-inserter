import {testGroup} from 'test-vir';
import {CodeExampleLink} from '../parsing-markdown/extract-links';
import {insertCodeExample, insertLine, replaceLines} from './insert-code';

testGroup({
    description: replaceLines.name,
    tests: (runTest) => {
        runTest({
            expect: ['a', 'b', 'insertion', 'e'],
            description: 'replaces multiple lines with the given string',
            test: () => {
                const replacedLines = replaceLines(['a', 'b', 'c', 'd', 'e'], [2, 3], 'insertion');

                return replacedLines;
            },
        });

        runTest({
            expect: ['insertion', 'd', 'e'],
            description: 'replaces at the beginning of the array',
            test: () => {
                const replacedLines = replaceLines(['a', 'b', 'c', 'd', 'e'], [0, 2], 'insertion');

                return replacedLines;
            },
        });

        runTest({
            expect: ['a', 'b', 'c', 'd', 'insertion'],
            description: 'replaces at the end of the array',
            test: () => {
                const replacedLines = replaceLines(['a', 'b', 'c', 'd', 'e'], [4, 4], 'insertion');

                return replacedLines;
            },
        });
    },
});

testGroup({
    description: insertLine.name,
    tests: (runTest) => {
        runTest({
            expect: ['a', 'b', 'c', 'd', 'insertion', 'e'],
            description: 'inserts into the middle of an array',
            test: () => {
                const replacedLines = insertLine(['a', 'b', 'c', 'd', 'e'], 4, 'insertion');

                return replacedLines;
            },
        });

        runTest({
            expect: ['a', 'insertion', 'b', 'c', 'd', 'e'],
            description: 'inserts after the beginning of an array',
            test: () => {
                const replacedLines = insertLine(['a', 'b', 'c', 'd', 'e'], 1, 'insertion');

                return replacedLines;
            },
        });

        runTest({
            expect: ['a', 'b', 'c', 'd', 'e', 'insertion'],
            description: 'inserts at the end of an array',
            test: () => {
                const replacedLines = insertLine(['a', 'b', 'c', 'd', 'e'], 5, 'insertion');

                return replacedLines;
            },
        });
    },
});

testGroup({
    description: insertCodeExample.name,
    tests: (runTest) => {
        runTest({
            expect: [
                'a',
                'linked comment here',
                `\`\`\`TypeScript\nconsole.info('derp');\n\`\`\``,
                'c',
                'd',
                'e',
            ],
            description: 'inserts code without a linked code block',
            test: () => {
                const replacedLines = insertCodeExample(
                    ['a', 'linked comment here', 'c', 'd', 'e'],
                    'TypeScript',
                    "console.info('derp');",
                    {
                        node: {
                            position: {
                                start: {line: 2},
                                end: {line: 3},
                            },
                        },
                    } as Readonly<CodeExampleLink>,
                );

                return replacedLines;
            },
        });

        runTest({
            expect: [
                'a',
                'linked comment here',
                `\`\`\`TypeScript\nconsole.info('derp');\n\`\`\``,
                'e',
            ],
            description: 'replaces code block when its present after the linked comment',
            test: () => {
                const replacedLines = insertCodeExample(
                    ['a', 'linked comment here', 'code block here', 'code block still here', 'e'],
                    'TypeScript',
                    "console.info('derp');",
                    {
                        node: {
                            position: {
                                start: {line: 1},
                                end: {line: 1},
                            },
                        },
                        linkedCodeBlock: {
                            position: {
                                start: {line: 2},
                                end: {line: 3},
                            },
                        },
                    } as Readonly<CodeExampleLink>,
                );

                return replacedLines;
            },
        });
    },
});
