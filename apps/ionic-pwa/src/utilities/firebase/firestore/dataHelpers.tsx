import { isArray, isError, isNumber } from "lodash";

/**
 * Firebase's `DocumentSnapshot` will by default type all values as `any`, which permits any following operation without
 * checks. This type alias simply changes the value type to `unknown`, forcing us to check the type of the value before
 * using it.
 *
 * Example:
 *
 *     const data = snapshot.data(); // All values of `data` are `any`
 *     const name: string = data.name; // `name` may not be a string but the compiler will accept this
 *     const upperCaseName = name.toUpperCase(); // will throw an error at run-time
 *
 * versus:
 *
 *     const data: StrictDocumentData = snapshot.data();
 *     const name: string = data.name; // Type 'unknown' is not assignable to type 'string'.
 *           ^^^^
 */
export type StrictDocumentData = Record<string, unknown>;

export function isString(value: unknown): value is string {
  return typeof value === "string";
}
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}
export function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}
export function isDocumentData(value: unknown): value is StrictDocumentData {
  return typeof value === "object" && value !== null;
}
export function isPermittedValue<T>(
  permitted: readonly T[],
): (value: unknown) => value is T {
  return function isPermittedValueTypecheck(val: unknown): val is T {
    return permitted.includes(val as T);
  };
}

export function isSet<T>(value: T | null): value is T {
  return value !== null;
}

// These functions coerce data received from Firestore into an expected form, used to implement schema-on-read.
// Firestore does not enforce any data consistency constraints, so there's always the possibility that structures we
// expect to be there will be malformed or absent entirely.

export function getValue<T>(
  value: unknown,
  {
    typeCheck,
    fallback,
  }: { typeCheck: (valueToCheck: unknown) => valueToCheck is T; fallback: T },
): T {
  if (typeCheck(value)) return value;
  return fallback;
}

export function getOptionalValue<T>(
  value: unknown,
  {
    typeCheck,
    fallback,
  }: {
    typeCheck: (valueToCheck: unknown) => valueToCheck is T;
    fallback: T | null;
  },
): T | null {
  if (!isSet(value)) return null;
  return getValue(value, { typeCheck, fallback });
}

export function getBoolean(
  value: unknown,
  { fallback }: { fallback: boolean } = { fallback: false },
): boolean {
  return getValue(value, { typeCheck: isBoolean, fallback });
}
export function getOptionalBoolean(
  value: unknown,
  { fallback }: { fallback: boolean | null } = { fallback: null },
): boolean | null {
  return getOptionalValue(value, { typeCheck: isBoolean, fallback });
}

export function getString(
  value: unknown,
  { fallback }: { fallback: string } = { fallback: "" },
): string {
  return getValue(value, { typeCheck: isString, fallback });
}
export function getOptionalString(
  value: unknown,
  { fallback }: { fallback: string | null } = { fallback: null },
): string | null {
  return getOptionalValue(value, { typeCheck: isString, fallback });
}

export function getNumber(
  value: unknown,
  { fallback }: { fallback: number } = { fallback: 0 },
): number {
  return getValue(value, { typeCheck: isNumber, fallback });
}
export function getOptionalNumber(
  value: unknown,
  { fallback }: { fallback: number | null } = { fallback: null },
): number | null {
  return getOptionalValue(value, { typeCheck: isNumber, fallback });
}

/**
 * Checks that the given value is a list and omits any element of the list that isn't the correct type.
 */
export function getList<T>(
  value: unknown,
  {
    element: typeCheck,
    fallback = [],
  }: { element: (valueToCheck: unknown) => valueToCheck is T; fallback?: T[] },
): T[] {
  if (!isArray(value)) return fallback;
  return value.filter(typeCheck);
}

export function getListOfObjects<T>(
  value: unknown,
  { getObject }: { getObject: (element: object) => T; fallback?: T[] },
): T[] {
  const list = getList(value, { element: isObject, fallback: [] });
  return list.map(getObject);
}

export function getStringLiteral<T extends string>(
  value: unknown,
  { permitted, fallback }: { permitted: readonly T[]; fallback: T },
): T {
  return getValue(value, { typeCheck: isPermittedValue(permitted), fallback });
}

export function getOptionalStringLiteral<T extends string>(
  value: unknown,
  {
    permitted,
    fallback = null,
  }: { permitted: readonly T[]; fallback?: T | null },
): T | null {
  return getOptionalValue(value, {
    typeCheck: isPermittedValue(permitted),
    fallback,
  });
}

export function getStrictDocumentData(
  value: unknown,
  {
    fallback,
  }: {
    fallback: StrictDocumentData;
  },
): StrictDocumentData {
  return getValue(value, { typeCheck: isDocumentData, fallback });
}

/**
 * Checks that the given value is an object and omits any unknown keys or values. This is not intended to retrieve
 * objects whose structure is known and rigid (like UTM Params), it's intended for dictionaries whose keys can be set
 * or unset freely (but where the key types and value types may be restricted to specific types).
 */
export function getDictionary<K extends string, V>(
  value: unknown,
  {
    isKey,
    isValue,
    fallback = {},
  }: {
    isKey: (value: unknown) => value is K;
    isValue: (value: unknown) => value is V;
    fallback: { [key in K]?: V };
  },
): { [key in K]?: V } {
  if (!isObject(value)) return fallback;

  const result: { [key in K]?: V } = {};
  for (const [currentKey, currentValue] of Object.entries(value)) {
    if (isKey(currentKey) && isValue(currentValue))
      result[currentKey] = currentValue;
  }

  return result;
}

export function getUrl(value: unknown): {
  url: string;
  domain: string | null;
  query: string | null;
} {
  const urlString = getString(value);
  let query = null;
  let domain = null;

  try {
    const url = new URL(urlString);
    query = url.search;
    domain = url.hostname;
  } catch (e) {
    if (!(isError(e) && e.name.match(/invalid url/i))) throw e;
  }

  return { url: urlString, domain, query };
}
