import {RunOptions} from 'npm-check-updates';
import {baseNcuConfig} from 'virmator/dist/compiled-base-configs/base-ncu';

export const ncuConfig: RunOptions = {
    ...baseNcuConfig,
    // exclude these
    reject: [
        ...baseNcuConfig.reject,
        'rehype-parse',
        'remark-parse',
        'remark-rehype',
        'unified',
    ],
    // include only these
    filter: [],
};
