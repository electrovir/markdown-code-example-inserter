import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {noSourceCodeDir, subPathImportExampleDir} from '../repo-paths.mock.js';
import {fixPackageImports} from './fix-package-imports.js';

describe(fixPackageImports.name, () => {
    it('fix index dir imports', async () => {
        const newCode = await fixPackageImports({
            codeExample: "import blah from '../';",
            codePath: join(noSourceCodeDir, 'src', 'readme-examples', 'derp.ts'),
            packageDir: join(noSourceCodeDir),
            forceIndexPath: undefined,
            language: 'TypeScript',
            overrideTsConfig: {
                options: {
                    outDir: 'dist',
                    rootDir: 'src',
                },
            },
            overridePackageJson: {
                name: 'derp',
                main: 'dist/index.js',
            },
        });

        assert.strictEquals(newCode, "import blah from 'derp';");
    });

    it('support index.js imports', async () => {
        const newCode = await fixPackageImports({
            codeExample: "import blah from '../index.js';",
            codePath: join(noSourceCodeDir, 'src', 'readme-examples', 'derp.ts'),
            packageDir: join(noSourceCodeDir),
            forceIndexPath: undefined,
            language: 'TypeScript',
            overrideTsConfig: {
                options: {
                    outDir: 'dist',
                    rootDir: 'src',
                },
            },
            overridePackageJson: {
                name: 'derp',
                main: 'dist/index.js',
            },
        });

        assert.strictEquals(newCode, "import blah from 'derp';");
    });

    it('fix index file imports with file name', async () => {
        const newCode = await fixPackageImports({
            codeExample: "import blah from '../index';",
            codePath: join(noSourceCodeDir, 'src', 'readme-examples', 'derp.ts'),
            packageDir: join(noSourceCodeDir),
            forceIndexPath: undefined,
            language: 'TypeScript',
            overrideTsConfig: {
                options: {
                    outDir: 'dist',
                    rootDir: 'src',
                },
            },
            overridePackageJson: {
                name: 'derp',
                main: 'dist/index.js',
            },
        });

        assert.strictEquals(newCode, "import blah from 'derp';");
    });

    it('fix index file imports no trailing slash', async () => {
        const newCode = await fixPackageImports({
            codeExample: "import blah from '..';",
            codePath: join(noSourceCodeDir, 'src', 'readme-examples', 'derp.ts'),
            packageDir: join(noSourceCodeDir),
            forceIndexPath: undefined,
            language: 'TypeScript',
            overrideTsConfig: {
                options: {
                    outDir: 'dist',
                    rootDir: 'src',
                },
            },
            overridePackageJson: {
                name: 'derp',
                main: 'dist/index.js',
            },
        });

        assert.strictEquals(newCode, "import blah from 'derp';");
    });

    it('fix index file imports and nothing else', async () => {
        const newCode = await fixPackageImports({
            codeExample: `import blah from '..';
                    const thingie = ['yo hi there', 'hello to you too'];`,
            codePath: join(noSourceCodeDir, 'src', 'readme-examples', 'derp.ts'),
            packageDir: join(noSourceCodeDir),
            forceIndexPath: undefined,
            language: 'TypeScript',
            overrideTsConfig: {
                options: {
                    outDir: 'dist',
                    rootDir: 'src',
                },
            },
            overridePackageJson: {
                name: 'derp',
                main: 'dist/index.js',
            },
        });

        assert.strictEquals(
            newCode,
            `import blah from 'derp';
                    const thingie = ['yo hi there', 'hello to you too'];`,
        );
    });

    it('fixes published sub path imports but not unpublished ones', async () => {
        const codePath = join(
            subPathImportExampleDir,
            'src',
            'readme-examples',
            'sub-path-import.example.ts',
        );
        const newCode = await fixPackageImports({
            codeExample: String(await readFile(codePath)),
            codePath,
            packageDir: subPathImportExampleDir,
            forceIndexPath: undefined,
        });

        assert.strictEquals(
            newCode,
            [
                "import {doThing} from 'sub-path-import-example';",
                "import {doNestedThing} from 'sub-path-import-example/dist/nested/index.js';",
                "import {doOtherThing} from 'sub-path-import-example/dist/nested/other.js';",
                "import {sharedValue} from './shared.example.js';",
                "import {otherSharedValue} from './shared.example.ts';",
                '',
                'console.info(doThing(), doNestedThing(), doOtherThing(), sharedValue, otherSharedValue);',
                '',
            ].join('\n'),
        );
    });
});
