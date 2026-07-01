import {assert, check} from '@augment-vir/assert';
import {addSuffix, mapObjectValues, removeColor} from '@augment-vir/common';
import {interpolationSafeWindowsPath, runShellCommand, type ShellOutput} from '@augment-vir/node';
import {
    assertTestContext,
    describe,
    it,
    TestEnv,
    type UniversalTestContext,
} from '@augment-vir/test';
import {readFile, writeFile} from 'node:fs/promises';
import {join, resolve, sep} from 'node:path';
import {forceIndexTrigger} from './cli/run-cli.js';
import {
    forcedIndexExampleDir,
    fullPackageExampleDir,
    fullPackageExampleFiles,
    repoRootDir,
} from './repo-paths.js';

async function runCli(
    context: UniversalTestContext,
    {
        args,
        dir,
        shouldPass,
    }: {
        args: string[];
        dir: string;
        expectationKey: string;
        shouldPass: boolean;
    },
) {
    const cliBinPath = resolve(import.meta.dirname, '..', 'bin.js');
    const commandToRun = interpolationSafeWindowsPath(`node ${cliBinPath} ${args.join(' ')}`);

    const result: Partial<ShellOutput> = await runShellCommand(commandToRun, {
        cwd: dir,
    });

    delete result.error;
    delete result.exitSignal;

    assertTestContext(context, TestEnv.Node);

    context.assert.snapshot(
        mapObjectValues(result, (key, value) => {
            if (check.isString(value)) {
                return removeColor(value).replaceAll(
                    addSuffix({
                        value: repoRootDir,
                        suffix: sep,
                    }),
                    '',
                );
            } else {
                return value;
            }
        }),
    );

    if (shouldPass) {
        assert.strictEquals(result.exitCode, 0, 'command should have passed');
    } else {
        assert.notStrictEquals(result.exitCode, 0, 'command should have failed');
    }
}

describe('cli.js', () => {
    it('produces correct output when a check passes', async (context) => {
        await runCli(context, {
            args: [
                fullPackageExampleFiles.readmeExpectation,
                '--check',
            ],
            dir: fullPackageExampleDir,
            expectationKey: 'successful check',
            shouldPass: true,
        });
    });

    it('produces correct output when a check fails', async (context) => {
        await runCli(context, {
            args: [
                join(fullPackageExampleDir, '*.md'),
                '--check',
            ],
            dir: fullPackageExampleDir,
            expectationKey: 'failed check',
            shouldPass: false,
        });
    });

    it('supports forced index flag', async (context) => {
        const completeMarkdownPath = join(forcedIndexExampleDir, 'complete.md');
        const incompleteMarkdownPath = join(forcedIndexExampleDir, 'incomplete.md');
        const incompleteContentsBeforeFixing = (await readFile(incompleteMarkdownPath)).toString();
        try {
            await runCli(context, {
                args: [
                    completeMarkdownPath,
                    '--check',
                    forceIndexTrigger,
                    'src/derp.ts',
                ],
                dir: forcedIndexExampleDir,
                expectationKey: 'forced-index-complete',
                shouldPass: true,
            });

            const completeContents = (await readFile(completeMarkdownPath)).toString();

            await runCli(context, {
                args: [
                    incompleteMarkdownPath,
                    forceIndexTrigger,
                    'src/derp.ts',
                ],
                dir: forcedIndexExampleDir,
                expectationKey: 'forced-index-incomplete-fix',
                shouldPass: true,
            });

            const incompleteContentsAfterFixing = (
                await readFile(incompleteMarkdownPath)
            ).toString();

            assert.strictEquals(incompleteContentsAfterFixing, completeContents);
        } finally {
            await writeFile(incompleteMarkdownPath, incompleteContentsBeforeFixing);

            await runCli(context, {
                args: [
                    incompleteMarkdownPath,
                    '--check',
                    forceIndexTrigger,
                    'src/derp.ts',
                ],
                dir: forcedIndexExampleDir,
                expectationKey: 'forced-index-incomplete-reverted',
                shouldPass: false,
            });
        }
    });
});
