import {join} from 'path';

export const repoRootDir = __dirname.replace(
    /(?:src|node_modules\/markdown-code-example-inserter\/dist|dist)$/,
    '',
);

const testFilesDirPath = join(repoRootDir, 'test-files');

export const noSourceCodeDir = join(testFilesDirPath, 'no-source-code');
export const noSourceCodeFiles = {
    comment: join(noSourceCodeDir, 'comment.md'),
    invalidLinkComments: join(noSourceCodeDir, 'invalid-link-comments.md'),
    linkPaths: join(noSourceCodeDir, 'link-paths.md'),
    linkWithCode: join(noSourceCodeDir, 'link-with-code.md'),
};

export const fullPackageExampleDir = join(testFilesDirPath, 'full-package-example');
export const forcedIndexExampleDir = join(testFilesDirPath, 'forced-index-example');
export const fullPackageExampleFiles = {
    readme: join(fullPackageExampleDir, 'README.md'),
    readmeExpectation: join(fullPackageExampleDir, 'README.expect.md'),
};

export const extendingTsConfigDir = join(testFilesDirPath, 'extending-ts-config');
export const extendingTsConfigFiles = {
    sourceDir: join(extendingTsConfigDir, 'src'),
    distDir: join(extendingTsConfigDir, 'dist'),
};
