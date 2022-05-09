import type {Parent} from 'unist';
import {noSourceCodeFiles} from '../repo-paths';
import {parseHtmlContents, parseMarkdownFile} from './parse-markdown';

describe('markdown parsing', () => {
    it('smoke test parsed node creation', async () => {
        const parsed = await parseMarkdownFile(noSourceCodeFiles.comment);
        // prevent excessive depth checking in nodes
        delete (parsed as Partial<Parent>).children;
        expect(parsed as Partial<Parent>).toEqual({
            type: 'root',
            position: {
                start: {
                    line: 1,
                    column: 1,
                    offset: 0,
                },
                end: {
                    line: 10,
                    column: 1,
                    offset: 83,
                },
            },
        });
    });

    it('smoke test parsed node creation', async () => {
        const parsed = parseHtmlContents(`<!-- comment is here -->`);
        // prevent excessive depth checking in nodes
        delete (parsed as Partial<Parent>).children;
        expect(parsed as Partial<Parent>).toEqual({
            type: 'root',
            data: {
                // idk what this means but it's in there
                quirksMode: false,
            },
            position: {
                start: {
                    line: 1,
                    column: 1,
                    offset: 0,
                },
                end: {
                    line: 1,
                    column: 25,
                    offset: 24,
                },
            },
        });
    });
});
