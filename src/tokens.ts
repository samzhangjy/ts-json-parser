export type LBrace = '{';
export type RBrace = '}';
export type LBracket = '[';
export type RBracket = ']';
export type String = '"';
export type Comma = ',';
export type Colon = ':';
export type Alpha =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';
export type Number = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type Keyword = 'true' | 'false' | 'null';

export type TokenType =
  | LBrace
  | RBrace
  | LBracket
  | RBracket
  | String
  | Colon
  | Comma
  | Alpha
  | Keyword
  | Number;

export interface IToken {
  type: TokenType;
  val?: any;
}

export type Token<T extends TokenType, V extends any = any> = {
  type: T;
  val: V;
};
