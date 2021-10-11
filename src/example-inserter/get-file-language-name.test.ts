import {testGroup} from 'test-vir';
import {getFileLanguageName} from './get-file-language-name';

testGroup({
    description: getFileLanguageName.name,
    tests: (runTest) => {
        runTest({
            expect: [
                'javascript',
                'typescript',
                'ruby',
                'markdown',
                'python',
                'c++',
                'c',
                'java',
                'json',
                'yaml',
                'xml',
            ],
            description: 'gets correct file name for common file extensions',
            test: () => {
                return [
                    'index.js',
                    'index.ts',
                    'index.rb',
                    'index.md',
                    'index.py',
                    'index.cpp',
                    'index.c',
                    'index.java',
                    'index.json',
                    'index.yml',
                    'index.xml',
                ].map((fileName) => getFileLanguageName(fileName)?.toLowerCase());
            },
        });
    },
});
