import { assertEquals } from "std_assert/mod.ts";

import { toNumber } from "@/mod.ts";

// ### Strings
Deno.test("Strings #1", () => {
  const maybeNumber = toNumber("42");

  assertEquals(maybeNumber, 42);
});

Deno.test("Strings #2", () => {
  const maybeNumber = toNumber("foo");

  assertEquals(maybeNumber, false);
});

//### Numbers
Deno.test("Numbers #1", () => {
  const maybeNumber = toNumber(0);

  assertEquals(maybeNumber, 0);
});

Deno.test("Numbers #2", () => {
  const maybeNumber = toNumber(NaN);

  assertEquals(maybeNumber, false);
});

// ### Booleans
Deno.test("Booleans #1", () => {
  const maybeNumber = toNumber(true);

  assertEquals(maybeNumber, false);
});

Deno.test("Booleans #2", () => {
  const maybeNumber = toNumber(true, { convertBooleans: true });

  assertEquals(maybeNumber, 1);
});

// ### Arrays
Deno.test("Arrays #1", () => {
  const maybeNumber = toNumber(["1", "2", "3"]);

  assertEquals(maybeNumber, [1, 2, 3]);
});

Deno.test("Arrays #2", () => {
  const maybeNumber = toNumber([1, "2", ["3"]], { convertNested: true });

  assertEquals(maybeNumber, [1, 2, [3]]);
});

Deno.test("Arrays #3", () => {
  const maybeNumber = toNumber([1, "2", "foo"]);

  assertEquals(maybeNumber, false);
});

// ### Objects
Deno.test("Objects #1", () => {
  const human = { age: "42", toes: "10" };
  const maybeNumber = toNumber(human);

  assertEquals(maybeNumber, { age: 42, toes: 10 });
});

Deno.test("Objects #2", () => {
  const human = { name: "foo", age: "42" };
  const maybeNumber = toNumber(human);

  assertEquals(maybeNumber, false);
});

Deno.test("Objects #3", () => {
  const human = {
    age: "42",
    pets: [
      { age: "1", legs: 6 },
      { age: 5, legs: "4" },
    ],
    electronics: {
      phones: "1",
      computers: 2,
    },
  };
  const maybeNumber = toNumber(human, { convertNested: true });

  assertEquals(maybeNumber, {
    age: 42,
    pets: [
      { age: 1, legs: 6 },
      { age: 5, legs: 4 },
    ],
    electronics: {
      phones: 1,
      computers: 2,
    },
  });
});

Deno.test("Objects #4", () => {
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

  assertEquals(maybeNumber, {
    age: 2,
    name: NaN,
    isAwesome: 1,
    versions: [1, 1.37, NaN],
  });
});
