interface ConvertOptions {
  allowNaN?: boolean;
  allowEmpty?: boolean;
  convertBooleans?: boolean;
  convertNested?: boolean;
}

export type ObjKey = string | number | symbol;

type NestedNumberArray<T> = Array<T> | Array<NestedNumberArray<T> | T | number>;

// export function toNumber<K extends ObjKey>(
//   value: number | string | boolean | unknown[] | Record<K, unknown>,
//   o?: {
//     allowNaN?: boolean;
//     allowEmpty?: boolean;
//     convertBooleans?: boolean;
//   }
// ): number | number[] | Record<ObjKey, number> | false;
/**
 * @description Converts a value to a number, number array, or number object.
 *
 * Options:
 * - `allowNaN`: If true, NaN values are allowed. Defaults to **false**.
 * - `allowEmpty`: If true, empty arrays and objects are returned as is. Defaults to **false**.
 * - `convertBooleans`: If true, boolean values are converted to 1 aswell as 0. Defaults to **false**.
 * - `convertNested`: If true, nested arrays and objects are converted. Defaults to **false**.
 */
export function toNumber(
  value: string,
  o?: {
    allowNaN?: boolean;
  }
): number | false;
export function toNumber(
  value: number,
  o?: { allowNaN?: boolean }
): number | false;
export function toNumber(
  value: boolean,
  o?: { convertBooleans: boolean }
): number | false;
/**
 * Note that if `convertNested` is true, the return type will be as many nested arrays as the input.
 * Hence the return type is **unknown[]** | false.
 */
export function toNumber(
  value: Array<string | number>,
  o?: {
    allowNaN?: boolean;
    allowEmpty?: boolean;
    convertBooleans?: boolean;
    // convertNested?: boolean;
  }
): number[] | false;
export function toNumber(
  value: NestedNumberArray<unknown>,
  o?: {
    allowNaN?: boolean;
    allowEmpty?: boolean;
    convertBooleans?: boolean;
    convertNested?: true;
  }
): NestedNumberArray<number[]> | false;
export function toNumber<K extends ObjKey>(
  value: Record<K, unknown>,
  o?: {
    allowNaN?: boolean;
    allowEmpty?: boolean;
    convertBooleans?: boolean;
    convertNested?: boolean;
  }
): Record<K, number> | false;
export function toNumber<K extends ObjKey>(
  value: unknown,
  o?: ConvertOptions
): number | Array<number | unknown> | Record<K, number> | false {
  const vtype = getValueType(value);

  switch (vtype) {
    case "boolean": {
      const bool = value as boolean;
      if (o?.convertBooleans) return convertBool(bool);
      return false;
    }
    case "string": {
      const str = value as string;
      const maybeNumber = Number(str);
      if (Number.isNaN(maybeNumber)) return false;
      const num = maybeNumber;
      return num;
    }
    case "number": {
      const num = value as number;
      if (Number.isNaN(num)) return false;
      return num;
    }
    case "array": {
      const arr = value as unknown[];
      const isEmpty = arr.length === 0;
      if (isEmpty && o?.allowEmpty) return [];
      if (isEmpty) return false;

      const numberArr = convertArray(arr, o);

      const shouldFailOnNaN = o?.allowNaN !== true;
      if (shouldFailOnNaN) {
        const hasNaNPresent = isNaNPresent(numberArr);
        if (hasNaNPresent === true) return false;
      }

      return numberArr;
    }
    case "object": {
      const obj = value as Record<K, unknown>;
      const isEmpty = isObjectEmpty(obj);
      if (isEmpty && o?.allowEmpty) return {} as Record<K, number>;
      if (isEmpty) return false;

      const converted = Object.entries(obj).map(([key, value]) => [
        key,
        Number(value),
      ]);

      const shouldFailOnNaN = o?.allowNaN !== true;
      if (shouldFailOnNaN) {
        const hasNaNPresent = isNaNPresent(converted);
        if (hasNaNPresent === true) return false;
      }

      return Object.fromEntries(converted);
    }
    case "notimplemented": {
      console.warn("Type not implemented for:", value);
      return false;
    }
    default:
      return false;
  }
}

function getValueType(value: unknown) {
  if (typeof value !== "object") return typeof value;

  if (Object.prototype.toString.call(value) === "[object Object]") {
    return "object";
  }
  if (Array.isArray(value)) return "array";
  return "notimplemented";
}

//@ts-ignore: if o.convertNested is true the return type will be as many nested arrays as the input
function convertArray(arr: unknown[], o?: ConvertOptions) {
  if (o?.convertBooleans) {
    return arr.map((item) => {
      if (Array.isArray(item) && o?.convertNested) return convertArray(item, o);
      if (typeof item === "boolean") return convertBool(item);
      return Number(item);
    });
  } else {
    return arr.map((item) => {
      if (Array.isArray(item) && o?.convertNested) return convertArray(item, o);
      return Number(item);
    });
  }
}

function isObjectEmpty<K extends ObjKey, V>(obj: Record<K, V>): boolean {
  return Object.keys(obj).length === 0;
}

function isNaNPresent(arr: unknown[]) {
  return arr.flat().some((item) => Number.isNaN(item) === true);
}

function convertBool(b: boolean): number {
  return b ? 1 : 0;
}
