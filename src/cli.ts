#! node
import {promise as glob} from 'glob-promise';
import {relative, resolve} from 'path';
import {MarkdownCodeExampleInserterError} from './errors/markdown-code-example-inserter.error';
import {writeAllExamples} from './example-inserter/example-inserter';

const forceIndexTrigger = '--index';
const ignoreTrigger = '--ignore';
const silentTrigger = '--silent';

type CliInputs = {
    forceIndex: string | undefined;
    silent: boolean;
    files: string[];
};

export async function parseArgs(args: string[]): Promise<CliInputs> {
    let forceIndex: string | undefined = undefined;
    let silent = false;
    const inputFiles: string[] = [];
    const globs: string[] = [];
    const ignoreList: string[] = [];
    let lastArgWasForceIndexTrigger = false;
    let lastArgWasIgnoreTrigger = false;

    args.forEach((arg) => {
        if (arg === forceIndexTrigger && forceIndex != undefined) {
            throw new MarkdownCodeExampleInserterError('Cannot have multiple index paths');
        } else if (arg === forceIndexTrigger) {
            lastArgWasForceIndexTrigger = true;
        } else if (lastArgWasForceIndexTrigger) {
            forceIndex = arg;
            lastArgWasForceIndexTrigger = false;
        } else if (arg === ignoreTrigger) {
            lastArgWasIgnoreTrigger = true;
        } else if (lastArgWasIgnoreTrigger) {
            ignoreList.push(arg);
            lastArgWasIgnoreTrigger = false;
        } else if (arg === silentTrigger) {
            silent = true;
        } else {
            globs.push(arg);
        }
    });
    await Promise.all(
        globs.map(async (globString) => {
            const paths = await glob(globString, {
                nodir: true,
                ignore: [...ignoreList, './**/node_modules/**'],
            });
            if (paths.length) {
                inputFiles.push(...paths.map((path) => relative(process.cwd(), path)));
            }
        }),
    );

    const uniqueFiles = Array.from(new Set(inputFiles));

    return {
        forceIndex,
        silent,
        files: uniqueFiles,
    };
}

export async function cli(rawArgs: string[], overrideDir?: string) {
    const args = await parseArgs(rawArgs);
    if (!args.files.length) {
        throw new MarkdownCodeExampleInserterError('No markdown files given to insert code into.');
    }
    if (!args.silent) {
        console.info(`Inserting code into markdown:`);
    }
    await Promise.all(
        args.files.map(async (relativeFilePath) => {
            if (!args.silent) {
                console.info(`    ${relativeFilePath}`);
            }
            await writeAllExamples(
                resolve(relativeFilePath),
                overrideDir || process.cwd(),
                args.forceIndex,
            );
        }),
    );
}

if (require.main === module) {
    cli(process.argv.slice(2));
}
