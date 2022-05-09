# markdown-code-example-insertion

Syncs markdown documentation with code examples.

# Install

Via [npm](https://www.npmjs.com/package/markdown-code-example-inserter):

```bash
npm i -D markdown-code-example-inserter
```

It's recommended to install this package as a dev dependency as it is a build-step operation.

# Usage

## Markdown files

Add an HTML comment that starts with the following text: `example-link:`. Then after that text, include a file path to the example file:

```html
<!-- example-link: src/readme-examples/do-thing.ts -->
```

[Here's an example](https://raw.githubusercontent.com/electrovir/markdown-code-example-inserter/main/test-repos/full-package-example/README.md) from the GitHub repo. And here is the same file [with the code examples inserted](https://github.com/electrovir/markdown-code-example-inserter/blob/main/test-repos/full-package-example/README.expect.md).

## CLI

```bash
npx md-code file1.md file2.md [...moreFiles]
```

Any of the file names can be a glob. Put the glob in quotes if you wish to prevent your shell from expanding it (this package will expand the glob):

```bash
npx md-code "./*.md"
```

### Check only

Use `--check`.

Check if the given files are updated, don't write anything.

```bash
npx md-code file1.md --check
```

### Force an index file

Use `--index`.

Force an index file for imports that should be rewritten with your package name:

```bash
npx md-code file1.md --index path/to/index.ts file2.md [...moreFiles]
```

The index file is used to replace relative imports with package name imports. Like changing `import from '../../index'` to `import from 'my-package'`.

### Ignore a pattern

Use `--ignore`.

```bash
npx md-code "./**/*.md" --ignore "./test-repos/**/*"
```

Multiple `--ignore` patterns can be used:

```bash
npx md-code "./**/*.md" --ignore "./test-repos/**/*" -ignore "./test-files/**/*"
```

`node_modules` is automatically ignored.

### Turn off logging

Use `--silent`

```bash
npx md-code --silent file1.md
```
