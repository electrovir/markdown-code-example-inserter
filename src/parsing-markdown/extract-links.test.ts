import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {readFile} from 'node:fs/promises';
import {MarkdownCodeExampleInserterError} from '../errors/markdown-code-example-inserter.error.js';
import {noSourceCodeFiles} from '../repo-paths.js';
import {linkCommentTriggerPhrase} from '../trigger-phrase.js';
import {type FullyPositionedNode, extractIndent, extractLinks} from './extract-links.js';

describe(extractLinks.name, () => {
    const expectedLinks: string[] = [
        'up here',
        'and down here',
    ] as const;

    it('preserves full comment value in original node', async () => {
        const links = extractLinks(await readFile(noSourceCodeFiles.invalidLinkComments));

        const joinedLinks = links.map((link) => link.node.value.trim());

        const expectation = expectedLinks.map((message) =>
            [
                linkCommentTriggerPhrase,
                message,
            ].join(' '),
        );

        assert.deepEquals(joinedLinks, expectation);
    });

    it('exclude trigger phrase in linkPath property', async () => {
        const links = extractLinks(await readFile(noSourceCodeFiles.invalidLinkComments));
        assert.deepEquals(
            links.map((link) => link.linkPath.trim()),
            expectedLinks,
        );
    });

    it('no links are extracted when no comments contain the trigger phrase', async () => {
        const links = extractLinks(await readFile(noSourceCodeFiles.comment));
        assert.deepEquals(
            links.map((link) => link.linkPath.trim()),
            [],
        );
    });

    it('includes code block', async () => {
        const links = extractLinks(await readFile(noSourceCodeFiles.linkWithCode));
        const firstLink = links[0];
        if (links.length !== 1 || !firstLink) {
            throw new MarkdownCodeExampleInserterError('Wrong links extracted');
        }
        assert.deepEquals(
            [
                firstLink.node,
                firstLink.linkedCodeBlock,
            ],
            [
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
        );
    });

    it('extracted line number is 1 indexed', () => {
        const links = extractLinks(
            '1 2 3                       a b c\n<!-- example-link: thing/derp.ts -->',
        );
        const firstLink = links[0];
        if (links.length !== 1 || !firstLink) {
            throw new MarkdownCodeExampleInserterError('Wrong links extracted');
        }

        assert.strictEquals(firstLink.node.position.end.line, 2);
    });
});

describe(extractIndent.name, () => {
    it("extracts no indent if the line text doesn't start with the node", () => {
        const indent = extractIndent('aaa derp', {
            value: 'derp',
            position: {
                start: {
                    column: 4,
                },
            },
        } as {value: unknown} & FullyPositionedNode);

        assert.strictEquals(indent, '');
    });

    it('extracts leading spaces when line starts with the node', () => {
        const indent = extractIndent('    derp', {
            value: 'derp',
            position: {
                start: {
                    column: 5,
                },
            },
        } as {value: unknown} & FullyPositionedNode);

        assert.strictEquals(indent, '    ');
    });

    it('extracts leading tabs when line starts with the node', () => {
        const indent = extractIndent('\t\t\t\tderp', {
            value: 'derp',
            position: {
                start: {
                    column: 5,
                },
            },
        } as {value: unknown} & FullyPositionedNode);

        assert.strictEquals(indent, '\t\t\t\t');
    });
});
