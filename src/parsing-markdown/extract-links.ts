import type {Comment} from 'hast';
import type {Code, HTML} from 'mdast';
import type {Node, Point, Position} from 'unist';
import {InvalidNodeError} from '../errors/invalid-node.error';
import {linkCommentTriggerPhrase, startsWithTriggerPhraseRegExp} from '../trigger-phrase';
import {isCodeBlock, isCommentNode, parseMarkdownContents} from './parse-markdown';
import {walk} from './walk';

export interface FullyDefinedPoint extends Point {
    offset: number;
}

export interface FullyDefinedPosition extends Position {
    start: FullyDefinedPoint;
    end: FullyDefinedPoint;
}

export interface FullyPositionedNode extends Node {
    position: FullyDefinedPosition;
}

export type CodeExampleLink = {
    node: Readonly<Comment & FullyPositionedNode>;
    linkPath: string;
    linkedCodeBlock: Readonly<Code & FullyPositionedNode> | undefined;
};

function isExampleLinkComment(input: Node): input is Comment {
    return isCommentNode(input) && input.value.trim().startsWith(linkCommentTriggerPhrase);
}

export function extractLinks(
    markdownFileContents: string | Readonly<Buffer>,
): Readonly<CodeExampleLink>[] {
    const parsedRoot = parseMarkdownContents(markdownFileContents);
    const comments: Readonly<Comment>[] = [];
    const codeBlocks: Record<number, Readonly<Code>> = {};

    let lastNode: Node | undefined;
    let lastHtmlNode: (HTML & FullyPositionedNode) | undefined;

    walk(parsedRoot, 'markdown', (node, language) => {
        if (language === 'markdown' && node.type === 'html') {
            assertFullyPositionedNode(node);
            lastHtmlNode = node as HTML & FullyPositionedNode;
        } else if (language === 'html' && isExampleLinkComment(node)) {
            if (!lastHtmlNode) {
                throw new InvalidNodeError(
                    node,
                    'encountered html node without first encountering html root node',
                );
            }
            assertFullyPositionedNode(node);
            const newNode = offsetNodePosition(node, lastHtmlNode);
            node = newNode;
            comments.push(newNode);
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
        assertFullyPositionedNode(comment);
        const codeBlock = codeBlocks[commentIndex];
        if (codeBlock) {
            assertFullyPositionedNode(codeBlock);
        }

        return {
            node: comment,
            linkPath: comment.value.trim().replace(startsWithTriggerPhraseRegExp, '').trim(),
            linkedCodeBlock: codeBlock,
        };
    });
}

function offsetNodePosition<T extends Node>(
    needsOffset: T & FullyPositionedNode,
    offsetBase: FullyPositionedNode,
): T & FullyPositionedNode {
    return {
        ...needsOffset,
        position: {
            ...needsOffset.position,
            start: {
                ...needsOffset.position.start,
                line: offsetBase.position.start.line + needsOffset.position.start.line - 1,
                offset: offsetBase.position.start.offset + needsOffset.position.start.offset,
            },
            end: {
                ...needsOffset.position.end,
                line: offsetBase.position.start.line + needsOffset.position.end.line - 1,
                offset: offsetBase.position.start.offset + needsOffset.position.end.offset,
            },
        },
    };
}

export function assertFullyPositionedNode(node: Node): asserts node is FullyPositionedNode {
    if (!node.position) {
        throw new InvalidNodeError(node, 'missing position property');
    }
    if (node.position.end.offset == undefined) {
        throw new InvalidNodeError(node, 'missing end position offset');
    }
    if (node.position.start.offset == undefined) {
        throw new InvalidNodeError(node, 'missing start position offset');
    }
}
