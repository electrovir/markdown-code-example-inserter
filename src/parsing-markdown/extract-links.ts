import type {Comment} from 'hast';
import type {Code} from 'mdast';
import type {Node} from 'unist';
import type {RequiredAndNotNullBy} from '../augments/type';
import {MarkdownCodeExampleInserterError} from '../errors/markdown-code-example-inserter.error';
import {linkCommentTriggerPhrase, startsWithTriggerPhraseRegExp} from '../trigger-phrase';
import {isCodeBlock, isCommentNode, parseMarkdownFileContents} from './parse-markdown';
import {walk} from './walk';

export type CodeExampleLink = {
    node: Readonly<RequiredAndNotNullBy<Comment, 'position'>>;
    linkPath: string;
    linkedCodeBlock: Readonly<RequiredAndNotNullBy<Code, 'position'>> | undefined;
};

function isExampleLinkComment(input: Node): input is Comment {
    return isCommentNode(input) && input.value.trim().startsWith(linkCommentTriggerPhrase);
}

export function extractLinks(
    markdownFileContents: string | Readonly<Buffer>,
): Readonly<CodeExampleLink>[] {
    const parsedRoot = parseMarkdownFileContents(markdownFileContents);
    const comments: Readonly<Comment>[] = [];
    const codeBlocks: Record<number, Readonly<Code>> = {};

    let lastNode: Node | undefined;

    walk(parsedRoot, 'markdown', (node, language) => {
        if (language === 'html' && isExampleLinkComment(node)) {
            comments.push(node);
        } else if (
            language === 'markdown' &&
            lastNode === comments[comments.length - 1] &&
            isCodeBlock(node)
        ) {
            codeBlocks[comments.length - 1] = node;
        }
        lastNode = node;
    });

    return comments.map((comment, commentIndex): CodeExampleLink => {
        if (!comment.position) {
            throw new MarkdownCodeExampleInserterError(
                `Comment node "${comment.value}" did not contain position`,
            );
        }
        const codeBlock = codeBlocks[commentIndex];
        if (codeBlock && !codeBlock.position) {
            throw new MarkdownCodeExampleInserterError(
                `Got a linked code block to comment "${comment.value}" but the code block node contained no position data.`,
            );
        }
        codeBlock;

        return {
            node: comment as CodeExampleLink['node'],
            linkPath: comment.value.trim().replace(startsWithTriggerPhraseRegExp, '').trim(),
            linkedCodeBlock: codeBlock as CodeExampleLink['linkedCodeBlock'],
        };
    });
}
