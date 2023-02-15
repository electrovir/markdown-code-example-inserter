import {interpolationSafeWindowsPath, runShellCommand, ShellOutput} from '@augment-vir/node-js';
import chai, {assert} from 'chai';
import {readFile, writeFile} from 'fs/promises';
import {basename, join} from 'path';
import {assertExpectation} from 'test-established-expectations';
import {forceIndexTrigger} from './cli';
import {forcedIndexExampleDir, fullPackageExampleDir, fullPackageExampleFiles} from './repo-paths';

chai.config.truncateThreshold = 0;

async function runCli({
    args,
    dir,
    expectationKey,
    shouldPass,
}: {
    args: string[];
    dir: string;
    expectationKey: string;
    shouldPass: boolean;
}) {
    const cliBinPath = join(process.cwd(), 'dist', 'cli.js');
    const commandToRun = interpolationSafeWindowsPath(`node ${cliBinPath} ${args.join(' ')}`);

    const result: Partial<ShellOutput> = await runShellCommand(commandToRun, {
        cwd: dir,
    });

    delete result.error;
    delete result.exitSignal;

    await assertExpectation({
        key: {
            topKey: basename(dir),
            subKey: expectationKey,
        },
        result,
    });

    if (shouldPass) {
        assert.strictEqual(result.exitCode, 0, 'command should have passed');
    } else {
        assert.notStrictEqual(result.exitCode, 0, 'command should have failed');
    }
}

describe('cli.js', () => {
    it('should produce correct output when a check passes', async () => {
        await runCli({
            args: [
                fullPackageExampleFiles.readmeExpectation,
                '--check',
            ],
            dir: fullPackageExampleDir,
            expectationKey: 'successful check',
            shouldPass: true,
        });
    });

    it('should produce correct output when a check fails', async () => {
        await runCli({
            args: [
                join(fullPackageExampleDir, '*.md'),
                '--check',
            ],
            dir: fullPackageExampleDir,
            expectationKey: 'failed check',
            shouldPass: false,
        });
    });

    it('supports forced index flag', async () => {
        const completeMarkdownPath = join(forcedIndexExampleDir, 'complete.md');
        const incompleteMarkdownPath = join(forcedIndexExampleDir, 'incomplete.md');
        const incompleteContentsBeforeFixing = (await readFile(incompleteMarkdownPath)).toString();
        try {
            await runCli({
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

            await runCli({
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

            assert.strictEqual(incompleteContentsAfterFixing, completeContents);
        } catch (error) {
        } finally {
            await writeFile(incompleteMarkdownPath, incompleteContentsBeforeFixing);

            await runCli({
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
