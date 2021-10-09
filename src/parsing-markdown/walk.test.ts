import {testGroup} from 'test-vir';
import type {Node} from 'unist';
import {noSourceCodeFiles} from '../repo-paths';
import {parseMarkdownFile} from './parse-markdown';
import {walk} from './walk';

testGroup({
    description: walk.name,
    tests: (runTest) => {
        async function getRootNode(filePath: string): Promise<Node> {
            return parseMarkdownFile(filePath);
        }

        runTest({
            expect: ['root', 'element', 'element', 'element', 'text', 'comment', 'text'],
            test: async () => {
                const nodeTypes: string[] = [];

                walk(await getRootNode(noSourceCodeFiles.withComment), (node) => {
                    nodeTypes.push(node.type);
                });

                return nodeTypes;
            },
        });
    },
});
