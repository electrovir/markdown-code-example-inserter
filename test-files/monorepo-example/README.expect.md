# Monorepo Example

<!-- example-link: packages/my-package/src/readme-examples/workspace-import.example.ts -->

```TypeScript
import {doThing} from 'my-package';
import {sharedValue} from './shared.example.js';

console.info(doThing(), sharedValue);
```
