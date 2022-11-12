import type { Add, Multiply } from 'ts-arithmetic';
import type {
  Alpha,
  Colon,
  Comma,
  IToken,
  Keyword,
  LBrace,
  LBracket,
  Number,
  RBrace,
  RBracket,
  String,
  Token,
} from './tokens';
import type { IfNot, ConvertToNumber } from './utils';

/**
 * Get the string content from `T`.
 * @param T The JSON string to extract strings from.
 * @param C Temporary storage for processed strings.
 * @returns The extracted string content from the beginning of `T`, or `never` if `T` does not begin with a JSON string.
 */
export type GetStringContent<
  T extends string,
  C extends string = '',
> = T extends `${infer U}${infer V}`
  ? // transpiles escape characters
    U extends '\\'
    ? V extends `${infer R}${infer F}`
      ? R extends '"'
        ? GetStringContent<F, `${C}"`>
        : R extends '\\'
        ? GetStringContent<F, `${C}\\`>
        : R extends 'n'
        ? GetStringContent<F, `${C}\n`>
        : R extends 'r'
        ? GetStringContent<F, `${C}\r`>
        : R extends 't'
        ? GetStringContent<F, `${C}\t`>
        : never
      : never
    : U extends '"'
    ? [Token<String, C>, V]
    : GetStringContent<V, `${C}${U}`>
  : never;

/**
 * Get keyword content from `T`.
 *
 * Keywords extracted here may not be correct as this is simply a
 * pattern-matching function. E.g.:
 *
 * ```json
 * {
 *     "key": value
 * }
 * ```
 *
 * Can still be validly extract by this function, meaning that the
 * keyword is not validated.
 *
 * @see ParseKeyword
 *
 * @param T The JSON string to extract keywords from.
 * @param C Temporary storage for processed keywords.
 * @returns A keyword token taken from the beginning of `T` or `never` if `T` does not begin with a keyword-like pattern.
 */
export type GetKeywordContent<
  T extends string,
  C extends string = '',
> = T extends `${infer U}${infer V}`
  ? U extends Alpha
    ? GetKeywordContent<V, `${C}${U}`>
    : IfNot<C, '', [Token<Keyword, C>, T]>
  : IfNot<C, '', [Token<Keyword, C>, T]>;

/**
 * Get the actual number content from `T`.
 * @param T The JSON string to extract number from.
 * @param C Temporary storage for processed numbers.
 * @returns A number taken from the beginning of `T` or `never` if `T` does not begin with a number.
 */
export type GetNumberContent<
  T extends string,
  C extends number = 0,
> = T extends `${infer U}${infer V}`
  ? U extends Number
    ? GetNumberContent<V, Add<Multiply<C, 10>, ConvertToNumber<U>>>
    : IfNot<C, never, [Token<Number, C>, T]>
  : IfNot<C, never, [Token<Number, C>, T]>;

/**
 * Tokenize a given JSON string.
 * @param T The JSON string to tokenize.
 * @param C The temporary storage for processed tokens.
 * @returns A list of tokens processed, or `never` if `T` is invalid.
 */
export type Tokenize<T extends string, C extends IToken[] = []> = T extends `${infer U}${infer V}`
  ? U extends '\n' | '\r' | '\t' | ' '
    ? Tokenize<V, C>
    : U extends LBrace
    ? Tokenize<V, [...C, Token<LBrace>]>
    : U extends RBrace
    ? Tokenize<V, [...C, Token<RBrace>]>
    : U extends LBracket
    ? Tokenize<V, [...C, Token<LBracket>]>
    : U extends RBracket
    ? Tokenize<V, [...C, Token<RBracket>]>
    : U extends Comma
    ? Tokenize<V, [...C, Token<Comma>]>
    : U extends Colon
    ? Tokenize<V, [...C, Token<Colon>]>
    : U extends String
    ? GetStringContent<V> extends [IToken, string]
      ? Tokenize<GetStringContent<V>[1], [...C, GetStringContent<V>[0]]>
      : never
    : U extends Alpha
    ? // IMPORTANT: Use `T` instead of `V` to get full keyword content
      GetKeywordContent<T> extends [IToken, string]
      ? Tokenize<GetKeywordContent<T>[1], [...C, GetKeywordContent<T>[0]]>
      : never
    : U extends Number
    ? GetNumberContent<T> extends [IToken, string]
      ? Tokenize<GetNumberContent<T>[1], [...C, GetNumberContent<T>[0]]>
      : never
    : never
  : C;

/**
 * Take the first token from `T`.
 *
 * Returns a tuple where the first value is the first token from `T` and the second value being the rest of tokens from `T`.
 *
 * @param T A list of tokens.
 * @returns The resulted tuple.
 */
export type GetFirstToken<T extends IToken[]> = T extends [infer U, ...infer V]
  ? [U, V] extends [IToken, IToken[]]
    ? [U, V]
    : never
  : never;
