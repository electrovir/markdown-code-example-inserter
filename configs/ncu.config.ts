import {RunOptions} from 'npm-check-updates';

export const ncuConfig: RunOptions = {
    color: true,
    upgrade: true,
    root: true,
    // exclude these
    reject: [
        'rehype-parse',
        'remark-parse',
        'remark-rehype',
        'unified',
    ],
    // include only these
    filter: [],
};
