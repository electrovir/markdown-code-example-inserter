import {systemRootPath, toPosixPath} from '@augment-vir/node';
import {dirname, join, posix, relative} from 'node:path';
import {type ParsedCommandLine} from 'typescript';
import {guessPackageIndex} from '../package-parsing/package-index.js';
import {type LanguageName} from './language-map.js';

const languageImportFixMap: Partial<
    Record<LanguageName, (code: string, regExpSafePosixPath: string, replaceName: string) => string>
> = {
    TypeScript: fixTypescriptImports,
};

export async function fixPackageImports(
    codeExample: string,
    codePath: string,
    packageDir: string,
    forceIndexPath: string | undefined,
    language: LanguageName = 'TypeScript',
    /** For testing purposes. */
    overrideTsConfig?: Partial<ParsedCommandLine>,
    /** For testing purposes. */
    overridePackageJson?: Record<string, string | undefined>,
): Promise<string> {
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
            newCode = importFixer(newCode, regExpSafePosixPath, packageIndex.replaceName);
        }
    }

    return newCode;
}

function fixTypescriptImports(
    code: string,
    regExpSafePosixPath: string,
    replaceName: string,
): string {
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

    return newCode;
}
