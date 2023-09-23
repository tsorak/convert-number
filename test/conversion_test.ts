import { assertEquals } from "std_assert/mod.ts";

import { toNumber } from "@/mod.ts";

//Strings
Deno.test("String conversions", async (t) => {
  await t.step("Convert from valid string", () => {
    const str = "123";
    const maybeNumber = toNumber(str);

    assertEquals(maybeNumber, 123);
  });

  await t.step("Convert from invalid string returns false", () => {
    const str = "Hello World!";
    const maybeNumber = toNumber(str);

    assertEquals(maybeNumber, false);
  });

  await t.step("Convert from invalid string with allowNaN returns NaN", () => {
    const str = "Hello World!";
    const maybeNumber = toNumber(str, { allowNaN: true });

    assertEquals(maybeNumber, NaN);
  });
});

//Numbers
Deno.test("Number conversions", async (t) => {
  await t.step("Convert from valid number", () => {
    const num = 123;
    const maybeNumber = toNumber(num);

    assertEquals(maybeNumber, 123);
  });

  await t.step("Convert from invalid number returns false", () => {
    const num = NaN;
    const maybeNumber = toNumber(num);

    assertEquals(maybeNumber, false);
  });

  await t.step("Convert from invalid number with allowNaN returns NaN", () => {
    const num = NaN;
    const maybeNumber = toNumber(num, { allowNaN: true });

    assertEquals(maybeNumber, NaN);
  });
});

Deno.test("Boolean conversions", async (t) => {
  await t.step("Convert from true returns false", () => {
    const bool = Math.random() > 0.5;
    const maybeNumber = toNumber(bool);

    assertEquals(maybeNumber, false);
  });

  await t.step("Convert from false returns false", () => {
    const bool = false;
    const maybeNumber = toNumber(bool);

    assertEquals(maybeNumber, false);
  });

  await t.step("Convert from true with convertBooleans returns 1", () => {
    const bool = true;
    const maybeNumber = toNumber(bool, { convertBooleans: true });

    assertEquals(maybeNumber, 1);
  });

  await t.step("Convert from false with convertBooleans returns 0", () => {
    const bool = false;
    const maybeNumber = toNumber(bool, { convertBooleans: true });

    assertEquals(maybeNumber, 0);
  });
});

//Arrays
Deno.test("Array conversions", async (t) => {
  await t.step("Convert from valid array", () => {
    const arr = ["123", "456", "789", "42"];
    const maybeNumber = toNumber(arr);

    assertEquals(maybeNumber, [123, 456, 789, 42]);
  });

  await t.step("Convert from array containing NaN values returns false", () => {
    const arr = ["123", "foo", "789"];
    const maybeNumber = toNumber(arr);

    assertEquals(maybeNumber, false);
  });

  await t.step("Convert from array containing NaN values with allowNaN", () => {
    const arr = ["123", "foo", "789"];
    const maybeNumber = toNumber(arr, { allowNaN: true });

    assertEquals(maybeNumber, [123, NaN, 789]);
  });

  await t.step("Convert from empty array returns false", () => {
    const arr: [] = [];
    const maybeNumber = toNumber(arr);

    assertEquals(maybeNumber, false);
  });

  await t.step(
    "Convert from empty array with allowEmpty returns empty array",
    () => {
      const arr: [] = [];
      const maybeNumber = toNumber(arr, { allowEmpty: true });

      assertEquals(maybeNumber, []);
    }
  );

  await t.step("Convert array with nested array returns NaN", () => {
    const arr = ["123", ["456", "789"], "42"];
    const maybeNumber = toNumber(arr, { allowNaN: true });

    assertEquals(maybeNumber, [123, NaN, 42]);
  });

  await t.step("Convert array with nested array with convertNested", () => {
    const arr = ["123", ["456", ["789"]], "42"];
    const maybeNumber = toNumber(arr, { convertNested: true });

    assertEquals(maybeNumber, [123, [456, [789]], 42]);
  });
});

Deno.test("Object conversions", async (t) => {
  await t.step("Convert from valid object", () => {
    const obj = { a: "123", b: "456", 1: "789", c: "42" };
    const maybeNumber = toNumber(obj);

    assertEquals(maybeNumber, { a: 123, b: 456, 1: 789, c: 42 });
  });

  await t.step(
    "Convert from object containing NaN values returns false",
    () => {
      const obj = { a: "123", b: "foo", c: "789", 1: 1 };
      const maybeNumber = toNumber(obj);

      assertEquals(maybeNumber, false);
    }
  );

  await t.step(
    "Convert from object containing NaN values with allowNaN",
    () => {
      const obj = { a: "123", b: "foo", c: "789", 1: 1 };
      const maybeNumber = toNumber(obj);

      assertEquals(maybeNumber, false);
    }
  );

  await t.step("Convert from empty object returns false", () => {
    const obj = {};
    const maybeNumber = toNumber(obj);

    assertEquals(maybeNumber, false);
  });

  await t.step(
    "Convert from empty object with allowEmpty returns empty object",
    () => {
      const obj = {};
      const maybeNumber = toNumber(obj, { allowEmpty: true });

      assertEquals(maybeNumber, {});
    }
  );

  await t.step("Convert object with nested object returns NaN", () => {
    const obj = { a: "123", b: { c: "456" }, d: "789" };
    const maybeNumber = toNumber(obj, { allowNaN: true });

    assertEquals(maybeNumber, { a: 123, b: NaN, d: 789 });
  });

  await t.step("Convert object with nested object with convertNested", () => {
    const obj = { a: "123", b: { c: "456", d: true }, e: "789" };
    const maybeNumber = toNumber(obj, {
      convertNested: true,
      allowNaN: true,
    });

    assertEquals(maybeNumber, { a: 123, b: { c: 456, d: NaN }, e: 789 });
  });
});
