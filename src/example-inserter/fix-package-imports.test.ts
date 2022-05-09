import {join} from 'path';
import {noSourceCodeDir} from '../repo-paths';
import {fixPackageImports} from './fix-package-imports';

describe(fixPackageImports.name, () => {
    it('fix index dir imports', async () => {
        const newCode = await fixPackageImports(
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

        expect(newCode).toBe(`import blah from 'derp';`);
    });

    it('fix index file imports with file name', async () => {
        const newCode = await fixPackageImports(
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

        expect(newCode).toBe(`import blah from 'derp';`);
    });

    it('fix index file imports no trailing slash', async () => {
        const newCode = await fixPackageImports(
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

        expect(newCode).toBe(`import blah from 'derp';`);
    });

    it('fix index file imports and nothing else', async () => {
        const newCode = await fixPackageImports(
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

        expect(newCode).toBe(`import blah from 'derp';
                    const thingie = ['yo hi there', 'hello to you too'];`);
    });
});
