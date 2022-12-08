import {assert, expect} from 'chai';
import {readFile} from 'fs-extra';
import {MarkdownCodeExampleInserterError} from '../errors/markdown-code-example-inserter.error';
import {noSourceCodeFiles} from '../repo-paths';
import {linkCommentTriggerPhrase} from '../trigger-phrase';
import {extractIndent, extractLinks, FullyPositionedNode} from './extract-links';

describe(extractLinks.name, () => {
    const expectedLinks: Readonly<string[]> = [
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

        expect(joinedLinks).to.deep.equal(expectation);
    });

    it('exclude trigger phrase in linkPath property', async () => {
        const links = extractLinks(await readFile(noSourceCodeFiles.invalidLinkComments));
        expect(links.map((link) => link.linkPath.trim())).to.deep.equal(expectedLinks);
    });

    it('no links are extracted when no comments contain the trigger phrase', async () => {
        const links = extractLinks(await readFile(noSourceCodeFiles.comment));
        expect(links.map((link) => link.linkPath.trim())).to.deep.equal([]);
    });

    it('includes code block', async () => {
        const links = extractLinks(await readFile(noSourceCodeFiles.linkWithCode));
        const firstLink = links[0];
        if (links.length !== 1 || !firstLink) {
            throw new MarkdownCodeExampleInserterError(`Wrong links extracted`);
        }
        expect([
            firstLink.node,
            firstLink.linkedCodeBlock,
        ]).to.deep.equal([
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
        ]);
    });

    it('extracted line number is 1 indexed', async () => {
        const links = extractLinks(
            '1 2 3                       a b c\n<!-- example-link: thing/derp.ts -->',
        );
        const firstLink = links[0];
        if (links.length !== 1 || !firstLink) {
            throw new MarkdownCodeExampleInserterError(`Wrong links extracted`);
        }

        assert.strictEqual(firstLink.node.position.end.line, 2);
    });
});

describe(extractIndent.name, () => {
    it("extracts no indent if the line text doesn't start with the node", () => {
        const indent = extractIndent('aaa derp', {
            value: 'derp',
            position: {start: {column: 4}},
        } as {value: unknown} & FullyPositionedNode);

        expect(indent).to.equal('');
    });

    it('extracts leading spaces when line starts with the node', () => {
        const indent = extractIndent('    derp', {
            value: 'derp',
            position: {start: {column: 5}},
        } as {value: unknown} & FullyPositionedNode);

        expect(indent).to.equal('    ');
    });

    it('extracts leading tabs when line starts with the node', () => {
        const indent = extractIndent('\t\t\t\tderp', {
            value: 'derp',
            position: {start: {column: 5}},
        } as {value: unknown} & FullyPositionedNode);

        expect(indent).to.equal('\t\t\t\t');
    });
});
