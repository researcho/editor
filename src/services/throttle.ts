function throttle<T extends (...args: any[]) => void>(
  func: T,
  options: { minimumFlushTime: number; maximumFlushTime: number }
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecuted = 0;
  let lastArgs: Parameters<T> | null = null;

  const throttledFunction = function(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    lastArgs = args;

    if (!timeoutId) {
      const executeFunction = () => {
        func.apply(this, lastArgs!);
        lastExecuted = Date.now();
        timeoutId = null;

        if (lastArgs) {
          const delay = Math.max(options.minimumFlushTime - (Date.now() - lastExecuted), 0);
          timeoutId = setTimeout(executeFunction, delay);
          lastArgs = null;
        }
      };

      const delay = Math.max(options.minimumFlushTime - (now - lastExecuted), 0);
      timeoutId = setTimeout(executeFunction, delay);
    }

    if (now - lastExecuted >= options.maximumFlushTime) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      func.apply(this, args);
      lastExecuted = now;
      timeoutId = null;
    }
  };

  return throttledFunction;
}

export default throttle;
