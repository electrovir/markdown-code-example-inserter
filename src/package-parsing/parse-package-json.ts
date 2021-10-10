import {existsSync, readFile} from 'fs-extra';
import {join, resolve} from 'path';

export type PackageDetails = {
    packageName: string | undefined;
    mainPath: string | undefined;
};

export async function readPackageDetails(
    packageDir: string,
    overridePackageJson?: Record<string, string | undefined>,
): Promise<Readonly<PackageDetails>> {
    const packageJson = overridePackageJson || (await findAndReadPackageJson(packageDir));

    if (!packageJson) {
        return {
            mainPath: undefined,
            packageName: undefined,
        };
    }
    const packageName = packageJson.name;
    const mainPath = packageJson.main ? resolve(join(packageDir, packageJson.main)) : undefined;

    return {
        packageName,
        mainPath,
    };
}

async function findAndReadPackageJson(
    packageDir: string,
): Promise<Record<string, string> | undefined> {
    const packageJsonPath = join(packageDir, 'package.json');
    if (!existsSync(packageJsonPath)) {
        return undefined;
    }
    const rawPackageJsonContents = await readFile(packageJsonPath);
    return JSON.parse(rawPackageJsonContents.toString());
}
