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
): Record<K, number | unknown> | false;
export function toNumber<K extends ObjKey>(
  value: unknown,
  o?: ConvertOptions
): number | Array<number | unknown> | Record<K, number | unknown> | false {
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

      const converted = convertObject(obj, o);

      const shouldFailOnNaN = o?.allowNaN !== true;
      if (shouldFailOnNaN) {
        const hasNaNPresent = isNaNPresent(converted);
        if (hasNaNPresent === true) return false;
      }

      // @ts-ignore:
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

  if (isObject(value)) {
    return "object";
  }
  if (Array.isArray(value)) return "array";
  return "notimplemented";
}

//@ts-ignore: if o.convertNested is true the return type will be as many nested arrays as the input
function convertArray(
  arr: unknown[],
  o?: ConvertOptions
  // ): number[] | NestedNumberArray<number[]> {
) {
  const shouldConvertNested = o?.convertNested === true;
  return arr.map((item) => {
    if (typeof item === "boolean") {
      if (o?.convertBooleans) return convertBool(item);
      return NaN;
    }
    if (shouldConvertNested) {
      if (Array.isArray(item)) return convertArray(item, o);
      if (isObject(item)) return convertObject(item, o);
    }
    return Number(item);
  });
}

//@ts-ignore: if o.convertNested is true the return type will be as many nested arrays as the input
function convertObject<K extends ObjKey, V>(
  obj: Record<K, V>,
  o?: ConvertOptions
) {
  const shouldConvertNested = o?.convertNested === true;
  return Object.entries(obj).map(([key, value]) => {
    if (typeof value === "boolean") {
      if (o?.convertBooleans) return [key, convertBool(value)];
      return [key, NaN];
    }
    if (shouldConvertNested) {
      if (Array.isArray(value)) return [key, convertArray(value, o)];
      if (isObject(value)) {
        return [key, Object.fromEntries(convertObject(value, o))];
      }
    }
    return [key, Number(value)];
  });
}

function isObject(obj: unknown): obj is Record<ObjKey, unknown> {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

function isObjectEmpty<K extends ObjKey, V>(obj: Record<K, V>): boolean {
  return Object.keys(obj).length === 0;
}

function isNaNPresent(arr: unknown[]) {
  return arr.flat(Infinity).some((item) => Number.isNaN(item) === true);
}

function convertBool(b: boolean): number {
  return b ? 1 : 0;
}
