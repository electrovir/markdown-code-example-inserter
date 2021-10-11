import {join} from 'path';

export const repoRootDir = __dirname.replace(
    /(?:src|node_modules\/markdown-code-example-inserter\/dist|dist)$/,
    '',
);

const testReposDir = join(repoRootDir, 'test-repos');

export const noSourceCodeDir = join(testReposDir, 'no-source-code');
export const noSourceCodeFiles = {
    comment: join(noSourceCodeDir, 'comment.md'),
    invalidLinkComments: join(noSourceCodeDir, 'invalid-link-comments.md'),
    linkPaths: join(noSourceCodeDir, 'link-paths.md'),
    linkWithCode: join(noSourceCodeDir, 'link-with-code.md'),
};

export const fullPackageExampleDir = join(testReposDir, 'full-package-example');
export const fullPackageExampleFiles = {
    readmeNoCodeBlocks: join(fullPackageExampleDir, 'README-no-code-blocks.md'),
    readmeNoCodeBlocksExpectation: join(fullPackageExampleDir, 'README-no-code-blocks.expect.md'),
};

export const extendingTsConfigDir = join(testReposDir, 'extending-ts-config');
export const extendingTsConfigFiles = {
    sourceDir: join(extendingTsConfigDir, 'src'),
    distDir: join(extendingTsConfigDir, 'dist'),
};
