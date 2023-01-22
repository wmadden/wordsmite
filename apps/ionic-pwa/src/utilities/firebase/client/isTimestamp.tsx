import { Timestamp } from "firebase/firestore";

export function isTimestamp(value: unknown): value is Timestamp {
  return value instanceof Timestamp;
}
