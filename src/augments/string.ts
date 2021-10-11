import {sep} from 'path';

export function replaceWithWindowsPathIfNeeded(input: string): string;
export function replaceWithWindowsPathIfNeeded(input: undefined): undefined;
export function replaceWithWindowsPathIfNeeded(input: string | undefined): string | undefined;
export function replaceWithWindowsPathIfNeeded(input: string | undefined): string | undefined {
    if (input == undefined) {
        return undefined;
    }
    if (sep === '/') {
        return input;
    } else {
        return input.replace(/\//g, sep);
    }
}
