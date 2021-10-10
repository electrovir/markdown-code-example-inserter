import type {Comment} from 'hast';
import type {Node} from 'unist';
import {RequiredAndNotNullBy} from '../augments/type';
import {linkCommentTriggerPhrase, startsWithTriggerPhraseRegExp} from '../trigger-phrase';
import {isComment, parseMarkdownFileContents} from './parse-markdown';
import {walk} from './walk';

export type CodeExampleLink = {
    node: Readonly<RequiredAndNotNullBy<Comment, 'position'>>;
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
        if (!comment.position) {
            throw new Error(`Comment node "${comment.value}" did not contain position`);
        }
        return {
            node: comment as CodeExampleLink['node'],
            linkPath: comment.value.trim().replace(startsWithTriggerPhraseRegExp, '').trim(),
        };
    });
}
