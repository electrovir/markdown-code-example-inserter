import {testGroup} from 'test-vir';
import type {Literal, Node, Parent, Position} from 'unist';
import {noSourceCodeFiles} from '../repo-paths';
import {parseHtmlContents, parseMarkdownContents, parseMarkdownFile} from './parse-markdown';
import {walk} from './walk';

testGroup({
    description: walk.name,
    tests: (runTest) => {
        async function getRootNode(filePath: string): Promise<Node> {
            return parseMarkdownFile(filePath);
        }

        runTest({
            description: 'basic markdown with html parsing',
            expect: [
                'root:markdown',
                'heading:markdown',
                'text:markdown',
                'heading:markdown',
                'text:markdown',
                'heading:markdown',
                'text:markdown',
                'comment:html',
                'heading:markdown',
                'text:markdown',
            ],
            test: async () => {
                const nodeTypes: string[] = [];

                walk(await getRootNode(noSourceCodeFiles.comment), 'markdown', (node, language) => {
                    nodeTypes.push(`${node.type}:${language}`);
                });

                return nodeTypes;
            },
        });

        runTest({
            description: 'html comment and markdown code are adjacent when walking',
            expect: [
                'root:markdown',
                'heading:markdown',
                'text:markdown',
                'heading:markdown',
                'text:markdown',
                'heading:markdown',
                'text:markdown',
                'comment:html',
                'code:markdown',
                'heading:markdown',
                'text:markdown',
            ],
            test: async () => {
                const nodeTypes: string[] = [];

                walk(
                    await getRootNode(noSourceCodeFiles.commentWithCode),
                    'markdown',
                    (node, language) => {
                        nodeTypes.push(`${node.type}:${language}`);
                    },
                );

                return nodeTypes;
            },
        });

        runTest({
            description: 'html only parsing produces the correct list of types',
            expect: [
                'root:html',
                'element:html',
                'text:html',
                'comment:html',
                'element:html',
                'text:html',
            ],
            test: () => {
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

                return nodeTypes;
            },
        });

        runTest({
            description: 'html parsing a comment only produces a comment node',
            expect: ['root:html', 'comment:html'],
            test: () => {
                const nodeTypes: string[] = [];

                walk(parseHtmlContents('<!-- comment is here -->'), 'html', (node, language) => {
                    nodeTypes.push(`${node.type}:${language}`);
                });

                return nodeTypes;
            },
        });

        runTest({
            description: 'node line positions make sense',
            expect: [
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
            ],
            test: () => {
                const positions: {type: string; value: unknown; position: Position | undefined}[] =
                    [];

                walk(
                    parseMarkdownContents('### honda\n_infinity_\n**buick**'),
                    'markdown',
                    (node) => {
                        if (!(node as Parent).children) {
                            positions.push({
                                type: node.type,
                                value: (node as Literal).value,
                                position: node.position,
                            });
                        }
                    },
                );

                return positions;
            },
        });
    },
});
