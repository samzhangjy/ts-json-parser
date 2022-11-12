/**
 * Converts a literal type to a primitive type.
 *
 * @param T The literal to convert.
 * @returns The converted primitive variant of `T`.
 */
export type ToPrimitive<T extends any> = {
  [K in keyof T]: T[K] extends object
    ? ToPrimitive<T[K]>
    : T[K] extends string
    ? string
    : T[K] extends number
    ? number
    : T[K] extends boolean
    ? boolean
    : T[K] extends null
    ? null
    : never;
};
