import type { ToPrimitive } from './primitive';
import type { GetFirstToken, Tokenize } from './tokenizer';
import type {
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
} from './tokens';
import type { IfNot, SetProperty, JSONObject } from './utils';

/**
 * Parses a JSON string.
 *
 * Returns a tuple `[U, V]`.
 *
 * - U: The parsed string content.
 * - V: The remaining of `T` without `U`.
 *
 * @param T A list of tokens to parse.
 * @returns The resulted tuple.
 */
export type ParseString<T extends IToken[]> = IfNot<
  GetFirstToken<T>,
  never,
  GetFirstToken<T>[0]['type'] extends String
    ? [GetFirstToken<T>[0]['val'], GetFirstToken<T>[1]]
    : never
>;

/**
 * Parses a JSON keyword from `T`.
 *
 * Returns a tuple `[U, V]`.
 *
 * - U: The keyword value `true`, `false` or `null`. Can be `never` if invalid.
 * - V: The remainings of `T` without `U`.
 *
 * @param T A list of tokens to parse from.
 * @returns The resulted tuple.
 */
export type ParseKeyword<T extends IToken[]> = IfNot<
  GetFirstToken<T>,
  never,
  GetFirstToken<T>[0]['type'] extends Keyword
    ? GetFirstToken<T>[0]['val'] extends 'true'
      ? [true, GetFirstToken<T>[1]]
      : GetFirstToken<T>[0]['val'] extends 'false'
      ? [false, GetFirstToken<T>[1]]
      : GetFirstToken<T>[0]['val'] extends 'null'
      ? [null, GetFirstToken<T>[1]]
      : never
    : never
>;

/**
 * Parses a JSON key-value pair from `T`.
 *
 * Returns a tuple `[U, V]`.
 *
 * - U: A tuple `[K, W]`.
 *   - K: The key of current key-value pair.
 *   - W: The value of current key-value pair, may be any literal type.
 * - V: The remaining tokens from `T` stripping tokens of `U`.
 *
 * @param T A list of tokens to parse from.
 * @returns The resulted tuple.
 */
export type ParseKeyValuePair<T extends IToken[]> = IfNot<
  ParseString<T>,
  never,
  IfNot<
    GetFirstToken<ParseString<T>[1]>,
    never,
    GetFirstToken<ParseString<T>[1]>[0]['type'] extends Colon
      ? ParseLiteral<GetFirstToken<ParseString<T>[1]>[1]> extends never
        ? never
        : [
            [ParseString<T>[0], ParseLiteral<GetFirstToken<ParseString<T>[1]>[1]>[0]],
            ParseLiteral<GetFirstToken<ParseString<T>[1]>[1]>[1],
          ]
      : never
  >
>;

/**
 * Recursively parses a JSON record.
 *
 * @internal
 * @see ParseObject
 *
 * @param T A list of tokens to parse.
 * @param C Temporary object for storing processed values.
 * @returns The resulted tuple.
 */
type ParseObjectImpl<T extends IToken[], C = {}> = IfNot<
  ParseKeyValuePair<T>,
  never,
  IfNot<
    GetFirstToken<ParseKeyValuePair<T>[1]>,
    never,
    GetFirstToken<ParseKeyValuePair<T>[1]>[0]['type'] extends RBrace
      ? [
          SetProperty<C, ParseKeyValuePair<T>[0][0], ParseKeyValuePair<T>[0][1]>,
          GetFirstToken<ParseKeyValuePair<T>[1]>[1],
        ]
      : GetFirstToken<ParseKeyValuePair<T>[1]>[0]['type'] extends Comma
      ? ParseObjectImpl<
          GetFirstToken<ParseKeyValuePair<T>[1]>[1],
          SetProperty<C, ParseKeyValuePair<T>[0][0], ParseKeyValuePair<T>[0][1]>
        >
      : never
  >
>;

/**
 * Parses a JSON record.
 *
 * Returns a tuple `[U, V]`.
 *
 * - U: The processed record object.
 * - V: Remainings from `T` without `U`.
 *
 * @param T A list of tokens to parse.
 * @returns The resulted tuple.
 */
export type ParseObject<T extends IToken[]> = T extends [infer U, ...infer V]
  ? U extends IToken
    ? V extends IToken[]
      ? U['type'] extends RBrace
        ? [{}, V]
        : ParseObjectImpl<T, {}>
      : never
    : never
  : never;

/**
 * Recursively parses a JSON array.
 *
 * @internal
 * @see ParseArray
 *
 * @param T A list of tokens to parse.
 * @param C Temporary storage for processed array items.
 * @returns The resulted tuple.
 */
type ParseArrayImpl<T extends IToken[], C extends any[] = []> = IfNot<
  ParseLiteral<T>,
  never,
  IfNot<
    GetFirstToken<ParseLiteral<T>[1]>,
    never,
    GetFirstToken<ParseLiteral<T>[1]>[0]['type'] extends Comma
      ? ParseArrayImpl<GetFirstToken<ParseLiteral<T>[1]>[1], [...C, ParseLiteral<T>[0]]>
      : GetFirstToken<ParseLiteral<T>[1]>[0]['type'] extends RBracket
      ? [[...C, ParseLiteral<T>[0]], GetFirstToken<ParseLiteral<T>[1]>[1]]
      : never
  >
>;

/**
 * Parses a JSON array.
 *
 * Returns a tuple `[U, V]`.
 *
 * - U: The processed array of literals.
 * - V The remaining tokens of `T` without `U`.
 *
 * @param T A list of tokens to parse.
 * @returns The resulted tuple.
 */
export type ParseArray<T extends IToken[]> = T extends [infer U, ...infer V]
  ? [U, V] extends [IToken, IToken[]]
    ? [U, V][0]['type'] extends RBracket
      ? [[], V]
      : ParseArrayImpl<T, []>
    : never
  : never;

/**
 * Parses a JSON number.
 *
 * Returns a tuple `[U, V]`.
 *
 * - U: The number value.
 * - V: The remaining tokens from `T` without `U`.
 *
 * @param T A list of tokens to parse.
 * @returns The resulted tuple.
 */
export type ParseNumber<T extends IToken[]> = IfNot<
  GetFirstToken<T>,
  never,
  GetFirstToken<T>[0]['type'] extends Number
    ? [GetFirstToken<T>[0]['val'], GetFirstToken<T>[1]]
    : never
>;

/**
 * Parses a JSON root.
 *
 * A JSON root can be either an object or an array, in which these
 * are the top-most building blocks of JSON.
 *
 * @see ParseObject
 * @see ParseArray
 *
 * @param T A list of tokens to parse.
 * @returns The processed object or array.
 */
export type ParseRoot<T extends IToken[]> = IfNot<
  GetFirstToken<T>,
  never,
  GetFirstToken<T>[0]['type'] extends LBrace
    ? ParseObject<GetFirstToken<T>[1]>
    : GetFirstToken<T>[0]['type'] extends LBracket
    ? ParseArray<GetFirstToken<T>[1]>
    : never
>;

/**
 * Parses a JSON literal.
 *
 * A JSON literal can be one of:
 *
 * - JSON object
 * - JSON array
 * - JSON string
 * - JSON number
 * - JSON keyword
 *
 * A plain JSON object is also a valid JSON literal.
 *
 * @see ParseRoot
 * @see ParseString
 * @see ParseKeyword
 * @see ParseNumber
 *
 * @param T A list of tokens to parse.
 * @returns The parsed result.
 */
export type ParseLiteral<T extends IToken[]> =
  | ParseRoot<T>
  | ParseString<T>
  | ParseKeyword<T>
  | ParseNumber<T>;

/**
 * Convert a string to a typed object.
 *
 * @param T The JSON string to convert.
 * @returns The converted JSON type object.
 */
export type JSON<T extends string> = JSONObject<ParseLiteral<Tokenize<T>>[0]>;

/**
 * Convert a string to a typed object, where each field is a
 * primitive representation of the actual value.
 *
 * @param T The JSON string to convert.
 * @returns The converted primitive JSON type object.
 */
export type JSONPrimitive<T extends string> = ToPrimitive<JSON<T>>;
