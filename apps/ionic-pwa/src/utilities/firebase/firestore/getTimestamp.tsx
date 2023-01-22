import { Timestamp } from "firebase/firestore";

import { getOptionalValue, getValue } from "./dataHelpers";

export default function getTimestamp(value: unknown): Timestamp {
  return getValue(value, {
    typeCheck: (val): val is Timestamp => val instanceof Timestamp,
    fallback: Timestamp.now(),
  });
}

export function getOptionalTimestamp(value: unknown): Timestamp | null {
  return getOptionalValue(value, {
    typeCheck: (val): val is Timestamp => val instanceof Timestamp,
    fallback: null,
  });
}
