import type {Comment, Root as HtmlRoot} from 'hast';
import type {Code, Html, Root as MarkdownRoot} from 'mdast';
import {readFile} from 'node:fs/promises';
import rehypeParse from 'rehype-parse';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import {unified} from 'unified';
import type {Node} from 'unist';

const markdownParser = unified().use(remarkParse).use(remarkRehype);
const htmlParser = unified().use(rehypeParse, {
    fragment: true,
});

export async function parseMarkdownFile(markdownFilePath: string): Promise<MarkdownRoot> {
    const fileContents = await readFile(markdownFilePath);
    return parseMarkdownContents(fileContents);
}

export function parseMarkdownContents(markdownFileContents: string | Buffer): MarkdownRoot {
    return markdownParser.parse(markdownFileContents);
}

export function isCommentNode(input: Node): input is Comment {
    return input.type === 'comment';
}

export function isCodeBlock(input: Node): input is Code {
    return input.type === 'code';
}

export function isHtmlNode(input: Node): input is Html {
    return input.type === 'html';
}

export function parseHtmlContents(htmlContents: string): HtmlRoot {
    return htmlParser.parse(htmlContents);
}

export function parseHtmlNode(htmlNode: Html): HtmlRoot {
    return parseHtmlContents(htmlNode.value);
}
