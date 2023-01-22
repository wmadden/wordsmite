import { QueryConstraint, where, WhereFilterOp } from "firebase/firestore";

export default function whereModel<T extends Record<string, unknown>>(
  fieldPath: keyof T & string,
  opStr: WhereFilterOp,
  value: unknown,
): QueryConstraint {
  return where(fieldPath, opStr, value);
}
