import {getSystemRootPath, toPosixPath} from '@augment-vir/node-js';
import {dirname, join, posix, relative} from 'path';
import {ParsedCommandLine} from 'typescript';
import {guessPackageIndex} from '../package-parsing/package-index';
import {LanguageName} from './get-file-language-name';

const languageImportFixMap: Partial<
    Record<LanguageName, (code: string, regExpSafePosixPath: string, replaceName: string) => string>
> = {
    TypeScript: fixTypescriptImports,
};

export async function fixPackageImports(
    codeExample: string,
    codePath: string,
    packageDir: string,
    language: LanguageName = 'TypeScript',
    forceIndexPath: string | undefined,
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
            ? forceIndexPath?.startsWith(getSystemRootPath())
                ? forceIndexPath
                : join(packageDir, forceIndexPath)
            : '';

        const relativePath = relative(
            dirname(codePath),
            forceIndexFullPath || packageIndex.indexPath,
        );
        const regExpSafePosixPath = toPosixPath(
            relativePath.startsWith('.') ? relativePath : `./${relativePath}`,
        ).replace(/\./g, '\\.');

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
    const indexFileImportRegExp = new RegExp(
        `( from ['"\`])${regExpSafePosixPath.replace(/\\\.\w+$/, '')}(['"\`])`,
        'g',
    );
    const bareIndexDirImportRegExp = new RegExp(
        `( from ['"\`])${posix.dirname(regExpSafePosixPath)}\/?(['"\`])`,
        'g',
    );

    let newCode = code.replace(indexFileImportRegExp, `$1${replaceName}$2`);
    if (posix.basename(regExpSafePosixPath).startsWith('index\\.')) {
        newCode = newCode.replace(bareIndexDirImportRegExp, `$1${replaceName}$2`);
    }

    return newCode;
}
