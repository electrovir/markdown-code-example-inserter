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

    function logInOrder() {
        const forLoggingNow = forFutureLogging.get(currentIndex);

        if (forLoggingNow) {
            forLoggingNow.consoleMethod.apply(console, forLoggingNow.args);
            currentIndex++;
            logInOrder();
        }
    }

    function setAndLogInOrder(index: number, consoleMethod: Function, ...args: string[]): void {
        forFutureLogging.set(index, {
            consoleMethod,
            args,
        });
        logInOrder();
    }

    return setAndLogInOrder;
}
