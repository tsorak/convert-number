interface ConvertOptions {
  allowNaN?: boolean;
  allowEmpty?: boolean;
  convertBooleans?: boolean;
  convertNested?: boolean;
  /**
   * @description If true, the initial value will be returned in case it's NaN.
   */
  //   keepInitialIfNaN?: boolean;
  //   omitNaNEntries?: boolean;
}

interface ParsedConvertOptions {
  shouldAllowNaN: boolean;
  shouldAllowEmpty: boolean;
  shouldConvertBooleans: boolean;
  shouldConvertNested: boolean;
}

function parseOptions(o?: ConvertOptions): ParsedConvertOptions {
  const shouldAllowNaN = o?.allowNaN === true;
  const shouldAllowEmpty = o?.allowEmpty === true;
  const shouldConvertBooleans = o?.convertBooleans === true;
  const shouldConvertNested = o?.convertNested === true;

  return {
    shouldAllowNaN,
    shouldAllowEmpty,
    shouldConvertBooleans,
    shouldConvertNested,
  };
}

export type ObjKey = string | number | symbol;

type NestedNumberArray<T> = Array<T> | Array<NestedNumberArray<T> | T | number>;

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
export function toNumber(
  value: Array<string | number>,
  o?: {
    allowNaN?: boolean;
    allowEmpty?: boolean;
    convertBooleans?: boolean;
    // convertNested?: boolean;
  }
): number[] | false;
export function toNumber<T>(
  value: NestedNumberArray<unknown>,
  o?: {
    allowNaN?: boolean;
    allowEmpty?: boolean;
    convertBooleans?: boolean;
    convertNested?: true;
  }
): NestedNumberArray<number[] | T> | false;
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
  const options = parseOptions(o);
  const { shouldAllowNaN, shouldAllowEmpty, shouldConvertBooleans } = options;

  const vtype = getValueType(value);

  switch (vtype) {
    case "boolean": {
      const bool = value as boolean;
      if (shouldConvertBooleans) return convertBool(bool);
      return false;
    }
    case "string": {
      const str = value as string;
      const maybeNumber = convertValueForType(str, "string", options);
      if (!shouldAllowNaN && Number.isNaN(maybeNumber)) return false;
      const num = maybeNumber;
      return num;
    }
    case "number": {
      const maybeNumber = convertValueForType(
        value as number,
        "number",
        options
      );
      if (!shouldAllowNaN && Number.isNaN(maybeNumber)) return false;
      const num = maybeNumber;
      return num;
    }
    case "array": {
      const arr = value as unknown[];
      const isEmpty = arr.length === 0;
      if (isEmpty) {
        return shouldAllowEmpty ? [] : false;
      }

      const converted = convertArray(arr, options);

      // converted is NaN if shouldAllowNaN is false and a NaN value is encountered.
      if (typeof converted === "number") return false;
      return converted;
    }
    case "object": {
      const obj = value as Record<K, unknown>;
      const isEmpty = isObjectEmpty(obj);
      if (isEmpty) {
        return shouldAllowEmpty ? ({} as Record<K, number>) : false;
      }

      const converted = convertObject(obj, options);

      // converted is NaN if shouldAllowNaN is false and a NaN value is encountered.
      if (typeof converted === "number") return false;
      return toObject(converted);
    }
    case "notimplemented": {
      console.warn("(convert-number) Type not implemented for:", value);
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

function convertValueForType(
  value: Record<ObjKey, unknown> | Array<unknown> | boolean | string | number,
  type: string,
  o: ParsedConvertOptions
): number | unknown[] | unknown[][] {
  switch (type) {
    case "array":
      if (!o.shouldConvertNested) return NaN;
      return convertArray(value as unknown[], o);
    case "object":
      if (!o.shouldConvertNested) return NaN;
      return convertObject(value as Record<ObjKey, unknown>, o);
    case "boolean":
      if (o.shouldConvertBooleans) return convertBool(value as boolean);
      return NaN;
    case "string":
      if (value === "") return NaN;
      return Number(value);
    case "number":
      return Number(value);
    case "notimplemented":
      console.log("(convert-number) Type not implemented for:", value);
      return NaN;
    default:
      return NaN;
  }
}

function convertArray<T>(arr: T[], o: ParsedConvertOptions) {
  let encounteredNaN = false;
  const triggerNaNEncountered = () => (encounteredNaN = true);

  const convertedArr = [...arr.entries()].map((kvPair) => {
    const [, value] = convertKvPair(kvPair, triggerNaNEncountered, o);
    return value;
  });

  if (encounteredNaN === false) return convertedArr;
  return o.shouldAllowNaN ? convertedArr : NaN;
}

function convertObject(obj: Record<ObjKey, unknown>, o: ParsedConvertOptions) {
  let encounteredNaN = false;
  const triggerNaNEncountered = () => (encounteredNaN = true);

  const convertedEntries = Object.entries(obj).map((kvPair) => {
    return convertKvPair(kvPair, triggerNaNEncountered, o);
  });

  if (encounteredNaN === false) return convertedEntries;
  return o.shouldAllowNaN ? convertedEntries : NaN;
}

function convertKvPair(
  kvPair: [ObjKey, unknown],
  encounteredNaN: () => void,
  o: ParsedConvertOptions
): [ObjKey, unknown] {
  const [key, value] = kvPair;

  const vtype = getValueType(value);
  //@ts-ignore: value can be unknown.
  const convertedValue = convertValueForType(value, vtype, o);
  const convertedType = getValueType(convertedValue);

  // Check every primitive value for NaN.
  // More efficeient as we don't need to loop over every item
  // in more complex types later on.
  //
  // TODO: Can be improved by breaking out of the loop as soon as NaN is encountered.
  if (
    o.shouldAllowNaN === false &&
    convertedType === "number" &&
    Number.isNaN(convertedValue)
  ) {
    encounteredNaN();
  }

  return vtype === "object" && o.shouldConvertNested
    ? [key, toObject(convertedValue as [ObjKey, unknown][])]
    : [key, convertedValue as number | unknown[]];
}

function toObject(obj: unknown[][]) {
  return Object.fromEntries(obj);
}

function isObject(obj: unknown): obj is Record<ObjKey, unknown> {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

function isObjectEmpty<K extends ObjKey, V>(obj: Record<K, V>): boolean {
  return Object.keys(obj).length === 0;
}

function convertBool(b: boolean): number {
  return b ? 1 : 0;
}
