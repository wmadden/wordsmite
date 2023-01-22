import { Timestamp } from "firebase/firestore";

import { getValue } from "./dataHelpers";

export default function getTimestamp(value: unknown): Timestamp {
  return getValue(value, {
    typeCheck: (val): val is Timestamp => val instanceof Timestamp,
    fallback: Timestamp.now(),
  });
}
