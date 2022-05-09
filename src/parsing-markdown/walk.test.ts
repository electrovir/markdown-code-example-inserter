import type {Literal, Node, Parent, Position} from 'unist';
import {noSourceCodeFiles} from '../repo-paths';
import {parseHtmlContents, parseMarkdownContents, parseMarkdownFile} from './parse-markdown';
import {walk, WalkLanguages} from './walk';

describe(walk.name, () => {
    async function getRootNode(filePath: string): Promise<Node> {
        return parseMarkdownFile(filePath);
    }

    it('basic markdown with html parsing', async () => {
        const nodeTypes: string[] = [];

        walk(await getRootNode(noSourceCodeFiles.comment), 'markdown', (node, language) => {
            nodeTypes.push(`${node.type}:${language}`);
        });

        expect(nodeTypes).toEqual([
            'root:markdown',
            'heading:markdown',
            'text:markdown',
            'heading:markdown',
            'text:markdown',
            'heading:markdown',
            'text:markdown',
            'html:markdown',
            'comment:html',
            'heading:markdown',
            'text:markdown',
        ]);
    });

    it('html comment and markdown code are adjacent when walking', async () => {
        const nodeTypes: string[] = [];

        walk(await getRootNode(noSourceCodeFiles.linkWithCode), 'markdown', (node, language) => {
            nodeTypes.push(`${node.type}:${language}`);
        });

        expect(nodeTypes).toEqual([
            'root:markdown',
            'heading:markdown',
            'text:markdown',
            'heading:markdown',
            'text:markdown',
            'heading:markdown',
            'text:markdown',
            'html:markdown',
            'comment:html',
            'code:markdown',
            'heading:markdown',
            'text:markdown',
        ]);
    });
    it('markdown with comment positions', async () => {
        const positions: {
            type: string;
            value: unknown;
            language: WalkLanguages;
            position: Position | undefined;
        }[] = [];

        walk(
            parseMarkdownContents(`## stuff\n<!-- \n comment here \n -->\n### more stuff`),
            'markdown',
            (node, language) => {
                positions.push({
                    type: node.type,
                    value: (node as Literal).value,
                    language,
                    position: node.position,
                });
            },
        );

        expect(positions).toEqual([
            {
                type: 'root',
                value: undefined,
                language: 'markdown',
                position: {
                    start: {
                        line: 1,
                        column: 1,
                        offset: 0,
                    },
                    end: {
                        line: 5,
                        column: 15,
                        offset: 49,
                    },
                },
            },
            {
                type: 'heading',
                value: undefined,
                language: 'markdown',
                position: {
                    start: {
                        line: 1,
                        column: 1,
                        offset: 0,
                    },
                    end: {
                        line: 1,
                        column: 9,
                        offset: 8,
                    },
                },
            },
            {
                type: 'text',
                value: 'stuff',
                language: 'markdown',
                position: {
                    start: {
                        line: 1,
                        column: 4,
                        offset: 3,
                    },
                    end: {
                        line: 1,
                        column: 9,
                        offset: 8,
                    },
                },
            },
            {
                type: 'html',
                value: '<!-- \n comment here \n -->',
                language: 'markdown',
                position: {
                    start: {
                        line: 2,
                        column: 1,
                        offset: 9,
                    },
                    end: {
                        line: 4,
                        column: 5,
                        offset: 34,
                    },
                },
            },
            {
                type: 'comment',
                value: ' \n comment here \n ',
                language: 'html',
                position: {
                    start: {
                        line: 1,
                        column: 1,
                        offset: 0,
                    },
                    end: {
                        line: 3,
                        column: 5,
                        offset: 25,
                    },
                },
            },
            {
                type: 'heading',
                value: undefined,
                language: 'markdown',
                position: {
                    start: {
                        line: 5,
                        column: 1,
                        offset: 35,
                    },
                    end: {
                        line: 5,
                        column: 15,
                        offset: 49,
                    },
                },
            },
            {
                type: 'text',
                value: 'more stuff',
                language: 'markdown',
                position: {
                    start: {
                        line: 5,
                        column: 5,
                        offset: 39,
                    },
                    end: {
                        line: 5,
                        column: 15,
                        offset: 49,
                    },
                },
            },
        ]);
    });

    it('html only parsing produces the correct list of types', async () => {
        const nodeTypes: string[] = [];

        walk(
            parseHtmlContents(
                '<a>anchor here</a><!-- comment is here --><button>button here</button>',
            ),
            'html',
            (node, language) => {
                nodeTypes.push(`${node.type}:${language}`);
            },
        );

        expect(nodeTypes).toEqual([
            'root:html',
            'element:html',
            'text:html',
            'comment:html',
            'element:html',
            'text:html',
        ]);
    });

    it('html parsing a comment only produces a comment node', async () => {
        const nodeTypes: string[] = [];

        walk(parseHtmlContents('<!-- comment is here -->'), 'html', (node, language) => {
            nodeTypes.push(`${node.type}:${language}`);
        });

        expect(nodeTypes).toEqual([
            'root:html',
            'comment:html',
        ]);
    });

    it('node line positions make sense', async () => {
        const positions: {type: string; value: unknown; position: Position | undefined}[] = [];

        walk(parseMarkdownContents('### honda\n_infinity_\n**buick**'), 'markdown', (node) => {
            if (!(node as Parent).children) {
                positions.push({
                    type: node.type,
                    value: (node as Literal).value,
                    position: node.position,
                });
            }
        });

        expect(positions).toEqual([
            {
                type: 'text',
                value: 'honda',
                position: {
                    start: {
                        line: 1,
                        column: 5,
                        offset: 4,
                    },
                    end: {
                        line: 1,
                        column: 10,
                        offset: 9,
                    },
                },
            },
            {
                type: 'text',
                value: 'infinity',
                position: {
                    start: {
                        line: 2,
                        column: 2,
                        offset: 11,
                    },
                    end: {
                        line: 2,
                        column: 10,
                        offset: 19,
                    },
                },
            },
            {
                type: 'text',
                value: '\n',
                position: {
                    start: {
                        line: 2,
                        column: 11,
                        offset: 20,
                    },
                    end: {
                        line: 3,
                        column: 1,
                        offset: 21,
                    },
                },
            },
            {
                type: 'text',
                value: 'buick',
                position: {
                    start: {
                        line: 3,
                        column: 3,
                        offset: 23,
                    },
                    end: {
                        line: 3,
                        column: 8,
                        offset: 28,
                    },
                },
            },
        ]);
    });
});
