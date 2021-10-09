import type {Node, Parent} from 'unist';

/**
 * Fire callback on node and all children of node recursively.
 *
 * @param node The starting node
 * @param callback The callback to handle the node. If this returns something truthy, then the
 *   walking is immediately aborted.
 * @returns True is walking was aborted early due to the callback returning true for a node, false
 *   if it was not aborted.
 */
export function walk(node: Node | Parent, callback: (node: Node) => unknown): boolean {
    if (callback(node)) {
        return true;
    }
    if ('children' in node) {
        return node.children.some((child) => {
            return walk(child, callback);
        });
    }
    return false;
}
