/**
 * merge objects inner array to one object
 */
export const mergeObjectArray = (arr: object[]): { [key: string]: any } => {
    return arr.reduce((prev, current) => Object.assign(prev, current), {});
}