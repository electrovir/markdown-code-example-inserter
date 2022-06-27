import {combineErrors, extractErrorMessage, getObjectTypedKeys, Overwrite} from 'augment-vir';
import {
    interpolationSafeWindowsPath,
    runShellCommand,
    ShellOutput,
} from 'augment-vir/dist/cjs/node-only';
import {join} from 'path';
import {fullPackageExampleDir, fullPackageExampleFiles} from './repo-paths';

async function runCli(
    args: string[],
    dir: string,
    expectations: Omit<
        Overwrite<ShellOutput, {stderr: string | RegExp; stdout: string | RegExp}>,
        'error'
    >,
    message = '',
) {
    const cliBinPath = join(process.cwd(), 'dist', 'cli.js');
    const commandToRun = interpolationSafeWindowsPath(`node ${cliBinPath} ${args.join(' ')}`);

    const results = await runShellCommand(commandToRun, {
        cwd: dir,
    });

    if (expectations) {
        const errors: Error[] = [];
        getObjectTypedKeys(expectations).forEach((expectationKey) => {
            const expectation = expectations[expectationKey];
            const result = results[expectationKey];

            const expectationMessage =
                expectation instanceof RegExp ? String(expectation) : expectation;
            // this is logged separately so that special characters (like color codes) are visible
            const mismatch = JSON.stringify(
                {
                    [`${message}${message ? '-' : ''}actual-${expectationKey}`]: result,
                    [`${message}${message ? '-' : ''}expected-${expectationKey}`]:
                        expectationMessage,
                },
                null,
                4,
            );

            const mismatchMessage = `\n${mismatch}\n`;
            try {
                if (expectation instanceof RegExp) {
                    expect(String(result)).toMatch(expectation);
                } else {
                    expect(result).toEqual(expectation);
                }
            } catch (error) {
                console.error(mismatchMessage);
                errors.push(new Error(extractErrorMessage(error)));
            }
        });
        if (errors.length) {
            throw combineErrors(errors);
        }
    }
}

describe('cli.js', () => {
    it('should produce correct output when a check passes', async () => {
        await runCli(
            [
                fullPackageExampleFiles.readmeExpectation,
                '--check',
            ],
            fullPackageExampleDir,
            {
                exitCode: 0,
                exitSignal: undefined,
                stderr: '',
                stdout: 'Checking that code in markdown is up to date:\n    README.expect.md: up to date\n',
            },
        );
    });

    it('should produce correct output when a check fails', async () => {
        await runCli(
            [
                join(fullPackageExampleDir, '**/*.md'),
                '--check',
            ],
            fullPackageExampleDir,
            {
                exitCode: 1,
                exitSignal: undefined,
                stderr: '    README.md: NOT up to date\nCode in Markdown file(s) is out of date. Run without --check to update.\n',
                stdout: 'Checking that code in markdown is up to date:\n    README.expect.md: up to date\n',
            },
        );
    });
});
