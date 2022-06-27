export function createOrderedLogging(): (
    index: number,
    consoleMethod: Function,
    ...args: string[]
) => void {
    let currentIndex = 0;
    const forFutureLogging = new Map<
        number,
        {
            args: string[];
            consoleMethod: Function;
        }
    >();

    function logInOrder(index: number) {
        const forLoggingNow = forFutureLogging.get(index);

        if (currentIndex === index && forLoggingNow) {
            forLoggingNow.consoleMethod.apply(console, forLoggingNow.args);
            logInOrder(index + 1);
        }
    }

    function setAndLogInOrder(index: number, consoleMethod: Function, ...args: string[]): void {
        forFutureLogging.set(index, {
            consoleMethod,
            args,
        });
        logInOrder(index);
    }

    return setAndLogInOrder;
}
