import { FirebaseError } from "firebase/app";
import { get } from "lodash";

export default function isFirebaseError(
  value: unknown,
): value is FirebaseError {
  const code: unknown = get(value, "code");
  const message: unknown = get(value, "message");
  const name: unknown = get(value, "name");
  return (
    typeof code === "string" &&
    !!code.match(/.+\/.+/) &&
    typeof message === "string" &&
    typeof name === "string"
  );
}
