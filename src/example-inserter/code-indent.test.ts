import {expect} from 'chai';
import {describe, it} from 'mocha';
import {fixCodeIndents} from './code-indent';

describe(fixCodeIndents.name, () => {
    it('should add an indent', () => {
        const replacedLines = fixCodeIndents('a b c d e', ' ');

        expect(replacedLines).to.deep.equal(' a b c d e');
    });
});
