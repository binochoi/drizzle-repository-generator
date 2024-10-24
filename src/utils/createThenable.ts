export const createThenable = <T>(fn: (...args: any[]) => any) => ({
    then: fn,
}) as Promise<T>