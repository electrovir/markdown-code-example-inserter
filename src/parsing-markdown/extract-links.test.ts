import {readFile} from 'fs-extra';
import {testGroup} from 'test-vir';
import {noSourceCodeFiles} from '../repo-paths';
import {linkCommentTriggerPhrase} from '../trigger-phrase';
import {extractLinks} from './extract-links';

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
            expect: {
                type: 'code',
                lang: 'typescript',
                meta: null,
                value: "console.log('hello there');",
                position: {
                    start: {
                        line: 9,
                        column: 1,
                        offset: 83,
                    },
                    end: {
                        line: 11,
                        column: 4,
                        offset: 128,
                    },
                },
            },
            description: 'includes code block',
            test: async () => {
                const links = extractLinks(await readFile(noSourceCodeFiles.commentWithCode));
                const firstLink = links[0];
                if (links.length !== 1 || !firstLink) {
                    throw new Error(`Wrong links extracted`);
                }
                return firstLink.linkedCodeBlock;
            },
        });
    },
});
