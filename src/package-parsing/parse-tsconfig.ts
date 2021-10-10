import {existsSync} from 'fs-extra';
import {join} from 'path';
import {ParsedCommandLine, parseJsonConfigFileContent, readConfigFile, sys} from 'typescript';

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

    const source = configContent.options?.rootDir;
    const output = configContent.options?.outDir;

    return {source, output};
}

function findAndReadTSConfig(packageDir: string): ParsedCommandLine | undefined {
    const tsConfigPath = join(packageDir, 'tsconfig.json');

    if (!existsSync(tsConfigPath)) {
        return undefined;
    }

    const configFile = readConfigFile(tsConfigPath, sys.readFile);
    const configContent = parseJsonConfigFileContent(configFile.config, sys, packageDir);
    return configContent;
}
