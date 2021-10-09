import {join} from 'path';

export const repoRootDir = __dirname.replace(
    /(?:src|node_modules\/markdown-code-example-inserter\/dist|dist)$/,
    '',
);

const testReposDir = join(repoRootDir, 'test-repos');

export const noSourceCodeDir = join(testReposDir, 'no-source-code');
export const noSourceCodeFiles = {
    withComment: join(noSourceCodeDir, 'comment.md'),
    withInvalidLinkComments: join(noSourceCodeDir, 'invalid-link-comments.md'),
    withLinkPaths: join(noSourceCodeDir, 'link-paths.md'),
};

export const fullPackageExampleDir = join(testReposDir, 'full-package-example');
