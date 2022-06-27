#!/usr/bin/env node
import {promise as glob} from 'glob-promise';
import {relative, resolve} from 'path';
import {createOrderedLogging} from './augments/console';
import {MarkdownCodeExampleInserterError} from './errors/markdown-code-example-inserter.error';
import {OutOfDateInsertedCodeError} from './errors/out-of-date-inserted-code.error';
import {isCodeUpdated, writeAllExamples} from './example-inserter/example-inserter';

const forceIndexTrigger = '--index';
const ignoreTrigger = '--ignore';
const silentTrigger = '--silent';
const checkOnlyTrigger = '--check';

type CliInputs = {
    forceIndex: string | undefined;
    silent: boolean;
    checkOnly: boolean;
    files: string[];
};

export async function parseArgs(args: string[]): Promise<CliInputs> {
    let forceIndex: string | undefined = undefined;
    let silent = false;
    const inputFiles: string[] = [];
    const globs: string[] = [];
    const ignoreList: string[] = [];
    let checkOnly = false;
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
        } else if (arg === checkOnlyTrigger) {
            checkOnly = true;
        } else if (arg === checkOnlyTrigger && checkOnly) {
            throw new MarkdownCodeExampleInserterError(
                `${checkOnlyTrigger} accidentally duplicated in your inputs`,
            );
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
                ignore: [
                    ...ignoreList,
                    './**/node_modules/**',
                ],
            });
            if (paths.length) {
                inputFiles.push(...paths.map((path) => relative(process.cwd(), path)));
            }
        }),
    );

    const uniqueFiles = Array.from(new Set(inputFiles)).sort();

    return {
        forceIndex,
        silent,
        checkOnly,
        files: uniqueFiles,
    };
}

export async function cli(rawArgs: string[], overrideDir?: string) {
    const args = await parseArgs(rawArgs);
    if (!args.files.length) {
        throw new MarkdownCodeExampleInserterError('No markdown files given to insert code into.');
    }
    if (!args.silent) {
        if (args.checkOnly) {
            console.info(`Checking that code in markdown is up to date:`);
        } else {
            console.info(`Inserting code into markdown:`);
        }
    }
    const errors: MarkdownCodeExampleInserterError[] = [];
    const orderedLog = createOrderedLogging();

    await Promise.all(
        args.files.map(async (relativeFilePath, index) => {
            try {
                if (args.checkOnly) {
                    const upToDate = await isCodeUpdated(
                        resolve(relativeFilePath),
                        overrideDir || process.cwd(),
                        args.forceIndex,
                    );
                    if (upToDate) {
                        if (!args.silent) {
                            orderedLog(index, console.info, `    ${relativeFilePath}: up to date`);
                        }
                    } else {
                        if (!args.silent) {
                            orderedLog(
                                index,
                                console.error,
                                `    ${relativeFilePath}: NOT up to date`,
                            );
                        }
                        errors.push(
                            new OutOfDateInsertedCodeError(
                                `${relativeFilePath} is not update to date.`,
                            ),
                        );
                    }
                } else {
                    if (!args.silent) {
                        orderedLog(index, console.info, `    ${relativeFilePath}`);
                    }
                    await writeAllExamples(
                        resolve(relativeFilePath),
                        overrideDir || process.cwd(),
                        args.forceIndex,
                    );
                }
            } catch (error) {
                const errorWrapper = new MarkdownCodeExampleInserterError(
                    `Errored on ${relativeFilePath}: ${String(error)}`,
                );
                console.error(errorWrapper.message);
                errors.push(errorWrapper);
            }
        }),
    );
    if (errors.length) {
        if (errors.every((error) => error instanceof OutOfDateInsertedCodeError)) {
            throw new OutOfDateInsertedCodeError(
                'Code in Markdown file(s) is out of date. Run without --check to update.',
            );
        } else {
            errors.forEach((error) => console.error(error));
            throw new MarkdownCodeExampleInserterError(`Code insertion into Markdown failed.`);
        }
    }
}

function errorHasMessage(error: unknown): error is {message: string} {
    return 'message' in (error as any) && typeof (error as any).message === 'string';
}

if (require.main === module) {
    cli(process.argv.slice(2)).catch((error: unknown) => {
        if (errorHasMessage(error)) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        process.exit(1);
    });
}
