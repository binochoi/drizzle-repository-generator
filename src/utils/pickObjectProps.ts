/**
 * matched 객체에서 target과 일치하는 property만 남겨놓는다.
 */
export const pickObjectProps = <A extends Record<string, any>, B extends Record<string, any>> (
  matched: A,
  target: B,
) => Object.fromEntries(Object.entries(matched).filter(([key]) => key in target)) as Pick<A, keyof A & keyof B>;
