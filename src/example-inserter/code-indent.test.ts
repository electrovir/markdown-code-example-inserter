import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {fixCodeIndents} from './code-indent.js';

describe(fixCodeIndents.name, () => {
    it('adds an indent', () => {
        const replacedLines = fixCodeIndents({
            rawCode: 'a b c d e',
            indent: ' ',
        });

        assert.strictEquals(replacedLines, ' a b c d e');
    });
});
