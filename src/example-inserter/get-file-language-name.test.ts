import {expect} from 'chai';
import {getFileLanguageName} from './get-file-language-name';

describe(getFileLanguageName.name, () => {
    it('gets correct file name for common file extensions', () => {
        expect(
            [
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
            ].map((fileName) => getFileLanguageName(fileName)?.toLowerCase()),
        ).to.deep.equal([
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
        ]);
    });
});
