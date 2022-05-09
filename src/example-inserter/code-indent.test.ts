import {fixCodeIndents} from './code-indent';

describe(fixCodeIndents.name, () => {
    it('should add an indent', () => {
        const replacedLines = fixCodeIndents('a b c d e', ' ');

        expect(replacedLines).toBe(' a b c d e');
    });
});
