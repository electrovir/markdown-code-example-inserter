import type {Node} from 'unist';
import {MarkdownCodeExampleInserterError} from './markdown-code-example-inserter.error';

export class InvalidNodeError extends MarkdownCodeExampleInserterError {
    public override name = 'InvalidNodeError';
    constructor(node: Node, reason: string) {
        super(`Invalid node (of type "${node.type}"), ${reason}: ${node}`);
    }
}
