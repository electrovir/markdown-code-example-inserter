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
                const links = extractLinks(
                    await readFile(noSourceCodeFiles.withInvalidLinkComments),
                );
                return links.map((link) => link.node.value.trim());
            },
        });

        runTest({
            expect: links,
            description: 'exclude trigger phrase in linkPath property',
            test: async () => {
                const links = extractLinks(
                    await readFile(noSourceCodeFiles.withInvalidLinkComments),
                );
                return links.map((link) => link.linkPath.trim());
            },
        });
    },
});
