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
    indent: string;
    linkedCodeBlock: Readonly<Code & FullyPositionedNode> | undefined;
};

function isExampleLinkComment(input: Node): input is Comment {
    return isCommentNode(input) && input.value.trim().startsWith(linkCommentTriggerPhrase);
}

export function extractIndent(
    line: string,
    node: Readonly<{value: unknown} & FullyPositionedNode>,
): string {
    if (typeof node.value === 'string' && line.trim().startsWith(node.value)) {
        return line.substring(
            0,
            // column is 1 indexed so we must remove 1 from it
            node.position.start.column - 1,
        );
    }

    return '';
}

export function extractLinks(
    markdownFileContents: string | Readonly<Buffer>,
): Readonly<CodeExampleLink>[] {
    const parsedRoot = parseMarkdownContents(markdownFileContents);
    const markdownLines = markdownFileContents.toString().split('\n');
    const commentData: {
        comment: Comment;
        indent: string;
        codeBlock?: Readonly<Code & FullyPositionedNode> | undefined;
    }[] = [];

    let lastNode: Node | undefined;
    let lastHtmlNode: {htmlNode: HTML & FullyPositionedNode; indent: string} | undefined;

    walk(parsedRoot, 'markdown', (node, language) => {
        const lastComment = commentData[commentData.length - 1];

        if (language === 'markdown' && isHtmlNode(node)) {
            assertFullyPositionedNode(node);
            const htmlLine =
                markdownLines[
                    // line is 1 indexed
                    node.position.start.line - 1
                ];
            if (!htmlLine) {
                throw new InvalidNodeError(
                    node,
                    `this HTML node's position.start.line is not actually a valid line number from the file it's in`,
                );
            }
            lastHtmlNode = {
                htmlNode: node,
                indent: extractIndent(htmlLine, node),
            };
        } else if (language === 'html' && isExampleLinkComment(node)) {
            if (!lastHtmlNode) {
                throw new InvalidNodeError(
                    node,
                    'encountered html node without first encountering html root node',
                );
            }
            assertFullyPositionedNode(node);
            const newNode = offsetNodePosition(node, lastHtmlNode.htmlNode);
            node = newNode;
            commentData.push({comment: newNode, indent: lastHtmlNode.indent});
        } else if (
            language === 'markdown' &&
            lastComment &&
            lastNode === lastComment.comment &&
            isCodeBlock(node)
        ) {
            assertFullyPositionedNode(node);
            lastComment.codeBlock = node;
        }
        lastNode = node;
    });

    const codeExampleLinks = commentData.map((comment): CodeExampleLink => {
        assertFullyPositionedNode(comment.comment);

        return {
            node: comment.comment,
            indent: comment.indent,
            linkPath: comment.comment.value
                .trim()
                .replace(startsWithTriggerPhraseRegExp, '')
                .trim(),
            linkedCodeBlock: comment.codeBlock,
        };
    });

    return codeExampleLinks;
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

function isHtmlNode(input: Node): input is HTML {
    return input.type === 'html';
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
