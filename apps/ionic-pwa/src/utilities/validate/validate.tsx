import * as number from "./validateNumber";
import * as operators from "./validateOperators";
import * as string from "./validateString";

export default Object.freeze({
  ...operators,
  string,
  number,
});
