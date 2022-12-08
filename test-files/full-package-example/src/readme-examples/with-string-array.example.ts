import {doThing} from '..';

async function main() {
    // used to test a previous bug where package import replacements were too loose
    const myFiles = [
        'path-to-my-test-file.js',
        'path-to-another-file.js',
    ];

    const results = myFiles.forEach(() => doThing());
}

main();
