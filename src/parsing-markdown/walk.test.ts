import {testGroup} from 'test-vir';
import type {Node} from 'unist';
import {noSourceCodeFiles} from '../repo-paths';
import {parseHtmlContents, parseMarkdownFile} from './parse-markdown';
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
    },
});
