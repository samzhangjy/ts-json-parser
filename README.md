# Type-level JSON Parser

A JSON parser written in TypeScript, and only TypeScript.

## Usage

First install `ts-json` with a package manager:

```bash
$ npm i ts-json-parser
```

Example:

```ts
import type { JSON } from 'ts-json-parser';

type Parsed = JSON<`{
  "title": "My Awesome Title",
  "description": "My awesome description."
}`>;

/*
type Parsed = {
  title: "My Awesome Title";
  description: "My awesome description.";
}
*/
```

To primitive types:

```ts
import type { JSONPrimitive } from 'ts-json-parser';

type Parsed = JSONPrimitive<`{
  "title": "My Awesome Title",
  "description": "My awesome description.",
  "price": 10,
  "inStock": true
}`>;

/*
type Parsed = {
  title: string;
  description: string;
  price: number;
  inStock: boolean;
}
*/
```

## TODO

- Support floating numbers
- Support `stringify`
