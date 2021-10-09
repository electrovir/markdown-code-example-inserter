import {testGroup} from 'test-vir';
import type {Parent} from 'unist';
import {noSourceCodeFiles} from '../repo-paths';
import {parseMarkdownFile} from './parse-markdown';

testGroup({
    description: 'markdown parsing',
    tests: (runTest) => {
        runTest({
            expect: {
                type: 'root',
                data: {
                    // idk what this means but it's in there
                    quirksMode: true,
                },
                position: {
                    start: {
                        line: 1,
                        column: 1,
                        offset: 0,
                    },
                    end: {
                        line: 8,
                        column: 1,
                        offset: 70,
                    },
                },
            },
            description: 'smoke test parsed node creation',
            test: async () => {
                const parsed = await parseMarkdownFile(noSourceCodeFiles.withComment);
                // prevent excessive depth checking in nodes
                delete (parsed as Partial<Parent>).children;
                return parsed;
            },
        });
    },
});
