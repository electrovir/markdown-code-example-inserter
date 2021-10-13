import {join} from 'path';
import {testGroup} from 'test-vir';
import {noSourceCodeDir} from '../repo-paths';
import {fixPackageImports} from './fix-package-imports';

testGroup({
    description: fixPackageImports.name,
    tests: (runTest) => {
        runTest({
            expect: `import blah from 'derp';`,
            description: 'fix index dir imports',
            test: async () => {
                const newCode = fixPackageImports(
                    `import blah from '../';`,
                    join(noSourceCodeDir, 'src', 'readme-examples', 'derp.ts'),
                    join(noSourceCodeDir),
                    'TypeScript',
                    undefined,
                    {
                        options: {
                            outDir: 'dist',
                            rootDir: 'src',
                        },
                    },
                    {
                        name: 'derp',
                        main: 'dist/index.js',
                    },
                );

                return newCode;
            },
        });

        runTest({
            expect: `import blah from 'derp';`,
            description: 'fix index file imports with file name',
            test: async () => {
                const newCode = fixPackageImports(
                    `import blah from '../index';`,
                    join(noSourceCodeDir, 'src', 'readme-examples', 'derp.ts'),
                    join(noSourceCodeDir),
                    'TypeScript',
                    undefined,
                    {
                        options: {
                            outDir: 'dist',
                            rootDir: 'src',
                        },
                    },
                    {
                        name: 'derp',
                        main: 'dist/index.js',
                    },
                );

                return newCode;
            },
        });

        runTest({
            expect: `import blah from 'derp';`,
            description: 'fix index file imports no trailing slash',
            test: async () => {
                const newCode = fixPackageImports(
                    `import blah from '..';`,
                    join(noSourceCodeDir, 'src', 'readme-examples', 'derp.ts'),
                    join(noSourceCodeDir),
                    'TypeScript',
                    undefined,
                    {
                        options: {
                            outDir: 'dist',
                            rootDir: 'src',
                        },
                    },
                    {
                        name: 'derp',
                        main: 'dist/index.js',
                    },
                );

                return newCode;
            },
        });

        runTest({
            expect: `import blah from 'derp';
                    const thingie = ['yo hi there', 'hello to you too'];`,
            description: 'fix index file imports and nothing else',
            test: async () => {
                const newCode = fixPackageImports(
                    `import blah from '..';
                    const thingie = ['yo hi there', 'hello to you too'];`,
                    join(noSourceCodeDir, 'src', 'readme-examples', 'derp.ts'),
                    join(noSourceCodeDir),
                    'TypeScript',
                    undefined,
                    {
                        options: {
                            outDir: 'dist',
                            rootDir: 'src',
                        },
                    },
                    {
                        name: 'derp',
                        main: 'dist/index.js',
                    },
                );

                return newCode;
            },
        });
    },
});
