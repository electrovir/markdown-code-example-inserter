import {replaceWithWindowsPathIfNeeded} from '@augment-vir/node';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {type ParsedCommandLine, parseJsonConfigFileContent, readConfigFile, sys} from 'typescript';

export type TsDirs = {
    source: string | undefined;
    output: string | undefined;
};

export function getTsDirs(
    packageDir: string,
    overrideTsConfig?: Partial<ParsedCommandLine>,
): TsDirs | undefined {
    const configContent = overrideTsConfig || findAndReadTSConfig(packageDir);

    if (!configContent) {
        return undefined;
    }

    const source = replaceWithWindowsPathIfNeeded(configContent.options?.rootDir ?? '');
    const output = replaceWithWindowsPathIfNeeded(configContent.options?.outDir ?? '');

    return {
        source,
        output,
    };
}

function findAndReadTSConfig(packageDir: string): ParsedCommandLine | undefined {
    const tsConfigPath = join(packageDir, 'tsconfig.json');

    if (!existsSync(tsConfigPath)) {
        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const configFile = readConfigFile(tsConfigPath, sys.readFile);
    return parseJsonConfigFileContent(configFile.config, sys, packageDir);
}
