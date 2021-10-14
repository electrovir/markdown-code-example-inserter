import {readFile} from 'fs-extra';
import {testGroup} from 'test-vir';
import {MarkdownCodeExampleInserterError} from '../errors/markdown-code-example-inserter.error';
import {noSourceCodeFiles} from '../repo-paths';
import {linkCommentTriggerPhrase} from '../trigger-phrase';
import {extractIndent, extractLinks, FullyPositionedNode} from './extract-links';

testGroup({
    description: extractLinks.name,
    tests: (runTest) => {
        const links: Readonly<string[]> = ['up here', 'and down here'] as const;

        runTest({
            expect: links.map((message) => [linkCommentTriggerPhrase, message].join(' ')),
            description: 'preserves full comment value in original node',
            test: async () => {
                const links = extractLinks(await readFile(noSourceCodeFiles.invalidLinkComments));
                return links.map((link) => link.node.value.trim());
            },
        });

        runTest({
            expect: links,
            description: 'exclude trigger phrase in linkPath property',
            test: async () => {
                const links = extractLinks(await readFile(noSourceCodeFiles.invalidLinkComments));
                return links.map((link) => link.linkPath.trim());
            },
        });

        runTest({
            expect: [],
            description: 'no links are extracted when no comments contain the trigger phrase',
            test: async () => {
                const links = extractLinks(await readFile(noSourceCodeFiles.comment));
                return links.map((link) => link.linkPath.trim());
            },
        });

        runTest({
            expect: [
                {
                    type: 'comment',
                    value: '  example-link: comment is here ',
                    position: {
                        start: {
                            line: 7,
                            column: 1,
                            offset: 42,
                        },
                        end: {
                            line: 7,
                            column: 40,
                            offset: 81,
                        },
                    },
                },
                {
                    type: 'code',
                    lang: 'typescript',
                    meta: null,
                    value: "console.info('hello there');",
                    position: {
                        start: {
                            line: 9,
                            column: 1,
                            offset: 83,
                        },
                        end: {
                            line: 11,
                            column: 4,
                            offset: 129,
                        },
                    },
                },
            ],
            description: 'includes code block',
            test: async () => {
                const links = extractLinks(await readFile(noSourceCodeFiles.linkWithCode));
                const firstLink = links[0];
                if (links.length !== 1 || !firstLink) {
                    throw new MarkdownCodeExampleInserterError(`Wrong links extracted`);
                }
                return [firstLink.node, firstLink.linkedCodeBlock];
            },
        });

        runTest({
            expect: 2,
            description: 'extracted line number is 1 indexed',
            test: async () => {
                const links = extractLinks(
                    '1 2 3                       a b c\n<!-- example-link: thing/derp.ts -->',
                );
                const firstLink = links[0];
                if (links.length !== 1 || !firstLink) {
                    throw new MarkdownCodeExampleInserterError(`Wrong links extracted`);
                }

                return firstLink.node.position.end.line;
            },
        });
    },
});

testGroup({
    description: extractIndent.name,
    tests: (runTest) => {
        runTest({
            expect: '',
            description: "extracts no indent if the line text doesn't start with the node",
            test: () => {
                const indent = extractIndent('aaa derp', {
                    value: 'derp',
                    position: {start: {column: 4}},
                } as {value: unknown} & FullyPositionedNode);

                return indent;
            },
        });

        runTest({
            expect: '    ',
            description: 'extracts leading spaces when line starts with the node',
            test: () => {
                const indent = extractIndent('    derp', {
                    value: 'derp',
                    position: {start: {column: 5}},
                } as {value: unknown} & FullyPositionedNode);

                return indent;
            },
        });

        runTest({
            expect: '\t\t\t\t',
            description: 'extracts leading tabs when line starts with the node',
            test: () => {
                const indent = extractIndent('\t\t\t\tderp', {
                    value: 'derp',
                    position: {start: {column: 5}},
                } as {value: unknown} & FullyPositionedNode);

                return indent;
            },
        });
    },
});
