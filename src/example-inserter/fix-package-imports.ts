import {toPosixPath} from 'augment-vir/dist/node';
import {basename, dirname, relative} from 'path';
import {ParsedCommandLine} from 'typescript';
import {guessPackageIndex} from '../package-parsing/package-index';

export async function fixPackageImports(
    codeExample: string,
    codePath: string,
    packageDir: string,
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
        const relativeIndexImportPath = toPosixPath(
            relative(dirname(codePath), forceIndexPath || packageIndex.indexPath),
        );

        newCode = newCode.replace(
            new RegExp(`(['"\`])${relativeIndexImportPath.replace(/\.\w+$/, '')}(['"\`])`, 'g'),
            `$1${packageIndex.replaceName}$2`,
        );
        if (basename(relativeIndexImportPath).startsWith('index.')) {
            newCode = newCode.replace(
                new RegExp(`(['"\`])${dirname(relativeIndexImportPath)}\/?(['"\`])`, 'g'),
                `$1${packageIndex.replaceName}$2`,
            );
        }
    }

    return newCode;
}
