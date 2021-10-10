import {join} from 'path';
import {testGroup} from 'test-vir';
import {extendingTsConfigDir, extendingTsConfigFiles, noSourceCodeDir} from '../repo-paths';
import {guessPackageIndex} from './package-index';

testGroup({
    description: guessPackageIndex.name,
    tests: (runTest) => {
        runTest({
            expect: {
                replaceName: 'extending-ts-config',
                indexPath: join(extendingTsConfigFiles.sourceDir, 'index.ts'),
            },
            description: 'resolves to index.ts',
            test: async () => {
                const guessedIndex = await guessPackageIndex(extendingTsConfigDir);

                return guessedIndex;
            },
        });

        runTest({
            expect: {
                replaceName: 'test-name',
                indexPath: join(noSourceCodeDir, 'index.ts'),
            },
            description: 'uses the package dir as the rootDir when no root dir is given',
            test: async () => {
                const guessedIndex = await guessPackageIndex(
                    noSourceCodeDir,
                    {options: {outDir: join(noSourceCodeDir, 'blah')}},
                    {name: 'test-name', main: 'blah/index.js'},
                );

                return guessedIndex;
            },
        });

        runTest({
            expect: {
                replaceName: 'test-name',
                indexPath: join(noSourceCodeDir, 'src', 'index.ts'),
            },
            description: 'guesses correct index.ts when all info is given',
            test: async () => {
                const guessedIndex = await guessPackageIndex(
                    noSourceCodeDir,
                    {
                        options: {
                            outDir: 'dist',
                            rootDir: 'src',
                        },
                    },
                    {
                        name: 'test-name',
                        main: 'dist/index.js',
                    },
                );

                return guessedIndex;
            },
        });

        runTest({
            expect: {
                replaceName: 'test-name',
                indexPath: join(noSourceCodeDir, 'blah', 'index.ts'),
            },
            description: 'reads the index from rootDir when no outDir exists',
            test: async () => {
                const guessedIndex = await guessPackageIndex(
                    noSourceCodeDir,
                    {options: {rootDir: join(noSourceCodeDir, 'blah')}},
                    {name: 'test-name', main: 'blah/index.js'},
                );

                return guessedIndex;
            },
        });

        runTest({
            expect: {
                replaceName: 'test-name',
                indexPath: join(noSourceCodeDir, 'blah', 'index.ts'),
            },
            description: 'no mapping if no tsConfig dirs',
            test: async () => {
                const guessedIndex = await guessPackageIndex(
                    noSourceCodeDir,
                    {options: {}},
                    {name: 'test-name', main: 'blah/index.js'},
                );

                return guessedIndex;
            },
        });

        runTest({
            expect: {
                replaceName: 'test-name',
                indexPath: join(noSourceCodeDir, 'blah', 'index.js'),
            },
            description: 'no ts replacement if no tsconfig',
            test: async () => {
                const guessedIndex = await guessPackageIndex(noSourceCodeDir, undefined, {
                    name: 'test-name',
                    main: 'blah/index.js',
                });

                return guessedIndex;
            },
        });

        runTest({
            expect: {
                replaceName: 'test-name',
                indexPath: noSourceCodeDir,
            },
            description: 'defaults to just the package dir when nothing else was given',
            test: async () => {
                const guessedIndex = await guessPackageIndex(noSourceCodeDir, undefined, {
                    name: 'test-name',
                    main: undefined,
                });

                return guessedIndex;
            },
        });
    },
});
