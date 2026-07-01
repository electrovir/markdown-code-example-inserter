import {extractRelevantArgs, replaceWithWindowsPathIfNeeded} from '@augment-vir/node';
import {glob} from 'glob';
import {existsSync} from 'node:fs';
import {relative, resolve} from 'node:path';
import {createOrderedLogging} from '../augments/console.js';
import {MarkdownCodeExampleInserterError} from '../errors/markdown-code-example-inserter.error.js';
import {OutOfDateInsertedCodeError} from '../errors/out-of-date-inserted-code.error.js';
import {isCodeUpdated, writeAllExamples} from '../example-inserter/example-inserter.js';

/**
 * Flag for setting a specific index file.
 *
 * @category Internals
 */
export const forceIndexTrigger = '--index';
const ignoreTrigger = '--ignore';
const silentTrigger = '--silent';
const checkOnlyTrigger = '--check';

/**
 * All args for the CLI. This is automatically generated inside of {@link runCli} via
 * {@link parseArgs}.
 *
 * @category Internals
 */
export type CliArgs = {
    forceIndex: string | undefined;
    silent: boolean;
    checkOnly: boolean;
    files: string[];
};

/**
 * Parse all CLI args out of a raw CLI arg string.
 *
 * @category Internals
 */
export async function parseArgs(
    rawArgs: ReadonlyArray<string>,
    filePath: string,
): Promise<CliArgs> {
    const args = extractRelevantArgs({
        rawArgs,
        binName: 'md-code',
        fileName: filePath || 'cli.js',
    });

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
            forceIndex = replaceWithWindowsPathIfNeeded(arg);
            lastArgWasForceIndexTrigger = false;
        } else if (arg === ignoreTrigger) {
            lastArgWasIgnoreTrigger = true;
        } else if (arg === checkOnlyTrigger && checkOnly) {
            throw new MarkdownCodeExampleInserterError(
                `${checkOnlyTrigger} accidentally duplicated in your inputs`,
            );
        } else if (arg === checkOnlyTrigger) {
            checkOnly = true;
        } else if (lastArgWasIgnoreTrigger) {
            ignoreList.push(arg);
            lastArgWasIgnoreTrigger = false;
        } else if (arg === silentTrigger) {
            silent = true;
        } else if (existsSync(arg)) {
            inputFiles.push(relative(process.cwd(), arg));
        } else {
            globs.push(arg);
        }
    });
    await Promise.all(
        globs.map(async (globString) => {
            const paths = await glob(globString, {
                ignore: [
                    ...ignoreList,
                    '**/node_modules/**',
                ],
                nodir: true,
                follow: true,
                nocase: true,
            });
            if (paths.length) {
                inputFiles.push(
                    ...paths.map((path) => {
                        return relative(process.cwd(), path);
                    }),
                );
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

/**
 * Run the `md-code` CLI.
 *
 * @category Main
 */
export async function runCli({
    cwd = process.cwd(),
    rawArgs,
    cliFilePath = 'cli.js',
}: Readonly<{
    rawArgs: ReadonlyArray<string>;
    cwd?: string;
    /** The file that is executing the CLI script. Used to determine CLI argument positioning. */
    cliFilePath?: string;
}>) {
    const args = await parseArgs(rawArgs, cliFilePath);
    if (!args.files.length) {
        throw new MarkdownCodeExampleInserterError('No markdown files given to insert code into.');
    }
    if (!args.silent) {
        if (args.checkOnly) {
            console.info('Checking that code in markdown is up to date:');
        } else {
            console.info('Inserting code into markdown:');
        }
    }
    const errors: Error[] = [];
    const orderedLog = createOrderedLogging();

    await Promise.all(
        args.files.map(async (relativeFilePath, index) => {
            try {
                if (args.checkOnly) {
                    const upToDate = await isCodeUpdated({
                        markdownPath: resolve(relativeFilePath),
                        packageDir: cwd,
                        forceIndexPath: args.forceIndex,
                    });
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
                    await writeAllExamples({
                        markdownPath: resolve(relativeFilePath),
                        packageDir: cwd,
                        forceIndexPath: args.forceIndex,
                    });
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
        if (
            /** Weird necessary as cast to prevent TypeScript's over-exuberant type guarding. */
            (errors as Error[]).every(
                (error): error is OutOfDateInsertedCodeError =>
                    error instanceof OutOfDateInsertedCodeError,
            )
        ) {
            throw new OutOfDateInsertedCodeError(
                'Code in Markdown file(s) is out of date. Run without --check to update.',
            );
        } else {
            errors.forEach((error) => console.error(error));
            throw new MarkdownCodeExampleInserterError('Code insertion into Markdown failed.');
        }
    }
}
