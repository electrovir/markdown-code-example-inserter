# Full Package Example

Explain what the package is doing here.

# Usage

<!-- this comment has no links -->

Example:

<!-- example-link: src/readme-examples/index-filename-import.example.ts -->

## Usage sub category

Sub category example:

<!-- example-link: src/readme-examples/no-index-filename-import.example.ts -->

## Usage sub category 2

Sub category 2 example:

<!-- example-link: src/readme-examples/no-trailing-slash-import.example.ts -->

```python
print('do the thing')
```

# Dev

-   stuff here
    <!-- example-link: src/readme-examples/with-string-array.example.ts -->

-   more stuff
    <!-- example-link: src/readme-examples/with-string-array.example.ts -->

    ```javascript
    console.log('yo');
    ```

-   stuff here
    <!-- example-link: src/readme-examples/with-string-array.example.ts -->

    ```TypeScript
    import {doThing} from 'full-package-example';

    async function main() {
        // used to test a previous bug where package import replacements were too loose
        const myFiles = ['path-to-my-test-file.js', 'path-to-another-file.js'];

        const results = myFiles.forEach(() => doThing());
    }

    main();
    ```

How to do dev and testing and stuff.
