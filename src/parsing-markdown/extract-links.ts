import type {Comment} from 'hast';
import type {Node} from 'unist';
import {linkCommentTriggerPhrase, startsWithTriggerPhraseRegExp} from '../trigger-phrase';
import {isComment, parseMarkdownFileContents} from './parse-markdown';
import {walk} from './walk';

export type CodeExampleLink = {
    node: Comment;
    linkPath: string;
};

function isExampleLinkComment(input: Node): input is Comment {
    return isComment(input) && input.value.trim().startsWith(linkCommentTriggerPhrase);
}

export function extractLinks(
    markdownFileContents: string | Readonly<Buffer>,
): Readonly<CodeExampleLink>[] {
    const parsedRoot = parseMarkdownFileContents(markdownFileContents);
    const comments: Readonly<Comment>[] = [];
    walk(parsedRoot, (node) => {
        if (isExampleLinkComment(node)) {
            comments.push(node);
        }
    });

    return comments.map((comment): CodeExampleLink => {
        return {
            node: comment,
            linkPath: comment.value.trim().replace(startsWithTriggerPhraseRegExp, '').trim(),
        };
    });
}
