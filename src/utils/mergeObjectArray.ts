/**
 * merge objects inner array to one object
 */
export const mergeObjectArray = (arr: object[]) => arr.reduce((prev, current) => ({
    ...prev,
    ...current,
}), {})