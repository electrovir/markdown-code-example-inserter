import {readFile} from 'fs-extra';
import type {Comment} from 'hast';
import rehypeParse from 'rehype-parse';
import remarkRehype from 'remark-rehype';
import unified from 'unified';
import type {Node} from 'unist';

const parser = unified().use(rehypeParse).use(remarkRehype);

export async function parseMarkdownFile(markdownFilePath: string): Promise<Node> {
    const fileContents = await readFile(markdownFilePath);
    return parseMarkdownFileContents(fileContents);
}

export function parseMarkdownFileContents(markdownFileContents: string | Buffer): Node {
    const parsedContents = parser.parse(markdownFileContents);
    return parsedContents;
}

export function isComment(input: Node): input is Comment {
    return input.type === 'comment';
}
