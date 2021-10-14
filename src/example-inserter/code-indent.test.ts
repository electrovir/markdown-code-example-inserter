import {testGroup} from 'test-vir';
import {fixCodeIndents} from './code-indent';

testGroup({
    description: fixCodeIndents.name,
    tests: (runTest) => {
        runTest({
            expect: ' a b c d e',
            description: 'adds an indent',
            test: () => {
                const replacedLines = fixCodeIndents('a b c d e', ' ');

                return replacedLines;
            },
        });
    },
});
