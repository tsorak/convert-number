# Number converter

## Description

Provides the `toNumber` function which helps with parsing numbers from/on various data types.

## Behaviors and usage

General philosophy: By default any occuring `NaN` values will result in `false` being returned.

### Strings

Converting from a valid string.

```ts
import { toNumber } from "https://raw.githubusercontent.com/tsorak/convert-number/master/mod.ts"

const maybeNumber = toNumber("42");

console.log(maybeNumber);
```

```ts
=> 42
```

Converting from an invalid string.

```ts
const maybeNumber = toNumber("foo")

console.log(maybeNumber);
```

```ts
=> false
```

### Numbers

```ts
const maybeNumber = toNumber(0)

console.log(maybeNumber)
```

```ts
=> 0
```

```ts
const maybeNumber = toNumber(NaN)

console.log(maybeNumber)
```

```ts
=> false
```

### Booleans

By default booleans are considered `NaN` values.

```ts
const maybeNumber = toNumber(true)

console.log(maybeNumber)
```

```ts
=> false
```

This can be changed with the `convertBooleans` option.

```ts
const maybeNumber = toNumber(true, { convertBooleans: true })

console.log(maybeNumber)
```

```ts
=> 1
```

### Arrays

```ts
const maybeNumber = toNumber(["1", "2", "3"])

console.log(maybeNumber)
```

```ts
=> [1, 2, 3]
```

Parsing nested arrays are **disabled** by default, enable it with the `convertNested` option.

```ts
const maybeNumber = toNumber([1, "2", ["3"]], { convertNested: true })

console.log(maybeNumber)
```

```ts
=> [1, 2, [3]]
```

If any value in the array could not be parsed `false` will be returned.

```ts
const maybeNumber = toNumber([1, "2", "foo"])

console.log(maybeNumber)
```

```ts
=> false
```

### Objects

```ts
const human = { age: "42", toes: "10" }
const maybeNumber = toNumber(human)

console.log(maybeNumber)
```

```ts
=> { age: 42, toes: 10 }
```

`false` will be returned if any value is `NaN`.

```ts
const human = { name: "foo", age: "42" }
const maybeNumber = toNumber(human)

console.log(maybeNumber)
```

```ts
=> false
```

Nested arrays and objects will be parsed then the `convertNested` option is provided.

```ts
const human = {
  age: "42",
  pets: [
    {age: "1", legs: 6},
    {age: 5, legs: "4"}
  ],
  electronics: {
    phones: "1",
    computers: 2
  }
}
const maybeNumber = toNumber(human, { convertNested: true })

console.log(maybeNumber)
```

```ts
=> {
  age: 42,
  pets: [
    {age: 1, legs: 6},
    {age: 5, legs: 4}
  ],
  electronics: {
    phones: 1,
    computers: 2
  }
}
```

Passing the `allowNaN` option overrides `false` being returned on any occuring `NaN` values.

```ts
const maybeNumber = toNumber(
  {
    age: "2",
    name: "Deno",
    isAwesome: true,
    versions: ["1.0", "1.37", "unstable"],
  },
  {
    allowNaN: true,
    convertNested: true,
    convertBooleans: true,
  }
);

console.log(maybeNumber);
```

```ts
=> {
  age: 2,
  name: NaN,
  isAwesome: 1,
  versions: [1, 1.37, NaN]
}
```

## Planned features

Option for keeping initial values for `NaN` entires.

Option for omitting `NaN` value entries from the final object/array.

## Current issues

No type safety for nested Objects/Arrays.
