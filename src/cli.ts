#! node
import {promise as glob} from 'glob-promise';
import {relative, resolve} from 'path';
import {MarkdownCodeExampleInserterError} from './errors/markdown-code-example-inserter.error';
import {writeAllExamples} from './example-inserter/example-inserter';

const forceIndexTrigger = '--index';
const ignoreTrigger = '--ignore';

type CliInputs = {
    forceIndex: string | undefined;
    files: string[];
};

export async function parseArgs(args: string[]): Promise<CliInputs> {
    let forceIndex: string | undefined = undefined;
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
        files: uniqueFiles,
    };
}

export async function cli(rawArgs: string[], overrideDir?: string) {
    const args = await parseArgs(rawArgs);
    await Promise.all(
        args.files.map(async (relativeFilePath) => {
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
