import {existsSync, readFile} from 'fs-extra';
import {join} from 'path';

export type PackageDetails = {
    packageName: string | undefined;
    mainPath: string | undefined;
};

export async function readPackageDetails(packagePath: string): Promise<Readonly<PackageDetails>> {
    const packageJsonPath = join(packagePath, 'package.json');
    if (!existsSync(packageJsonPath)) {
        return {
            mainPath: undefined,
            packageName: undefined,
        };
    }
    const rawPackageJsonContents = await readFile(packageJsonPath);
    const packageJson: Record<string, string | undefined> = JSON.parse(
        rawPackageJsonContents.toString(),
    );

    const packageName = packageJson.name;
    const mainPath = packageJson.main;

    return {
        packageName,
        mainPath,
    };
}
