import {type MaybePromise} from '@augment-vir/common';
import {systemRootPath, toPosixPath} from '@augment-vir/node';
import {basename, dirname, join, posix, relative, resolve} from 'node:path';
import {type ParsedCommandLine} from 'typescript';
import {guessPackageIndex} from '../package-parsing/package-index.js';
import {getTsDirs} from '../package-parsing/parse-tsconfig.js';
import {readPublishedFiles} from '../package-parsing/published-files.js';
import {type LanguageName} from './language-map.js';

const languageImportFixMap: Partial<
    Record<
        LanguageName,
        (
            input: Readonly<{
                code: string;
                codePath: string;
                packageDir: string;
                regExpSafePosixPath: string;
                replaceName: string;
                overrideTsConfig: Partial<ParsedCommandLine> | undefined;
            }>,
        ) => MaybePromise<string>
    >
> = {
    TypeScript: fixTypescriptImports,
};

export async function fixPackageImports({
    codeExample,
    codePath,
    packageDir,
    forceIndexPath,
    language = 'TypeScript',
    overrideTsConfig,
    overridePackageJson,
}: Readonly<{
    codeExample: string;
    codePath: string;
    packageDir: string;
    forceIndexPath: string | undefined;
    language?: LanguageName | undefined;
    overrideTsConfig?: Partial<ParsedCommandLine> | undefined;
    overridePackageJson?: Record<string, string | undefined> | undefined;
}>): Promise<string> {
    let newCode = codeExample;
    const packageIndex = await guessPackageIndex(packageDir, overrideTsConfig, overridePackageJson);

    // fix imports
    if (packageIndex.replaceName) {
        const forceIndexFullPath = forceIndexPath
            ? forceIndexPath.startsWith(systemRootPath)
                ? forceIndexPath
                : join(packageDir, forceIndexPath)
            : '';

        const relativePath = relative(
            dirname(codePath),
            forceIndexFullPath || packageIndex.indexPath,
        );
        const regExpSafePosixPath = toPosixPath(
            relativePath.startsWith('.') ? relativePath : `./${relativePath}`,
        ).replace(/\./g, String.raw`\.`);

        const importFixer = languageImportFixMap[language];

        if (importFixer) {
            newCode = await importFixer({
                code: newCode,
                codePath,
                packageDir,
                regExpSafePosixPath,
                replaceName: packageIndex.replaceName,
                overrideTsConfig,
            });
        }
    }

    return newCode;
}

async function fixTypescriptImports({
    code,
    codePath,
    packageDir,
    regExpSafePosixPath,
    replaceName,
    overrideTsConfig,
}: Readonly<{
    code: string;
    codePath: string;
    packageDir: string;
    regExpSafePosixPath: string;
    replaceName: string;
    overrideTsConfig: Partial<ParsedCommandLine> | undefined;
}>) {
    const indexFileImportRegExpPath = regExpSafePosixPath.replace(
        /\\\.\w+$/,
        String.raw`(?:\.[cm]?[jt]s[x]?)?`,
    );
    const indexFileImportRegExp = new RegExp(
        `( from ['"\`])${indexFileImportRegExpPath}(['"\`])`,
        'g',
    );
    const bareIndexDirImportRegExp = new RegExp(
        `( from ['"\`])${posix.dirname(regExpSafePosixPath)}/?(['"\`])`,
        'g',
    );

    let newCode = code.replace(indexFileImportRegExp, `$1${replaceName}$2`);
    if (posix.basename(regExpSafePosixPath).startsWith(String.raw`index\.`)) {
        newCode = newCode.replace(bareIndexDirImportRegExp, `$1${replaceName}$2`);
    }

    return await fixTypescriptSubPathImports({
        code: newCode,
        codePath,
        packageDir,
        replaceName,
        overrideTsConfig,
    });
}

/**
 * Rewrites relative imports of other published package files into package sub path imports, such as
 * `'../saml/index.js'` into `'auth-vir/dist/saml/index.js'`. Imports of unpublished files (like
 * other `.example.ts` files) are left relative.
 */
async function fixTypescriptSubPathImports({
    code,
    codePath,
    packageDir,
    replaceName,
    overrideTsConfig,
}: Readonly<{
    code: string;
    codePath: string;
    packageDir: string;
    replaceName: string;
    overrideTsConfig: Partial<ParsedCommandLine> | undefined;
}>) {
    const relativeImportRegExp = /( from ['"`])(\.\.?\/[^'"`]+)(['"`])/g;

    if (!relativeImportRegExp.test(code)) {
        return code;
    }

    const tsDirs = getTsDirs(packageDir, overrideTsConfig);
    const sourceDir = resolve(packageDir, tsDirs?.source || '');
    const outputDir = resolve(packageDir, tsDirs?.output || tsDirs?.source || '');
    const publishedFiles = await readPublishedFiles(packageDir);

    return code.replace(
        relativeImportRegExp,
        (fullMatch, prefix: string, importPath: string, suffix: string) => {
            const importedPath = join(dirname(codePath), importPath);
            const isTsImport = /\.[cm]?tsx?$/.test(importedPath);
            /** TypeScript ESM imports reference the compiled `.js` file, or omit the extension. */
            const importedSourcePath = isTsImport
                ? importedPath
                : /\.[cm]?jsx?$/.test(importedPath)
                  ? importedPath.replace(/js(x?)$/, 'ts$1')
                  : `${importedPath}.ts`;

            if (
                !importedSourcePath.startsWith(sourceDir) ||
                !publishedFiles.includes(importedSourcePath)
            ) {
                return fullMatch;
            }

            const outputPath = join(
                outputDir,
                relative(sourceDir, dirname(importedPath)),
                isTsImport && outputDir !== sourceDir
                    ? basename(importedPath).replace(/tsx?$/, 'js')
                    : basename(importedPath),
            );

            return [
                prefix,
                replaceName,
                '/',
                toPosixPath(relative(packageDir, outputPath)),
                suffix,
            ].join('');
        },
    );
}
