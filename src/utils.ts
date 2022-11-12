import type { Number } from './tokens';

export type IfNot<C extends any, Q = never, U = any> = C extends Q ? never : U;

export type SetProperty<T, K extends PropertyKey, V> = {
  [P in keyof T | K]: P extends K ? V : P extends keyof T ? T[P] : never;
};

export type JSONObject<T> = T extends object
  ? {
      [P in keyof T]: JSONObject<T[P]>;
    }
  : T;

export type ConvertToNumber<T extends Number> = T extends '0'
  ? 0
  : T extends '1'
  ? 1
  : T extends '2'
  ? 2
  : T extends '3'
  ? 3
  : T extends '4'
  ? 4
  : T extends '5'
  ? 5
  : T extends '6'
  ? 6
  : T extends '7'
  ? 7
  : T extends '8'
  ? 8
  : T extends '9'
  ? 9
  : never;
