import { FieldError } from "../../utilities/formState/FormState";

/**
 * Value is valid if all of the validators pass.
 */
export function all<ValueType>(
  validatorFns: ((fieldState: { value: ValueType }) => FieldError[])[],
): (fieldState: { value: ValueType }) => FieldError[] {
  return (fieldState) =>
    validatorFns.map((validatorFn) => validatorFn(fieldState)).flat();
}

/**
 * Value is valid if any one of the validators passes.
 */
export function either<ValueType>(
  validatorFns: ((fieldState: { value: ValueType }) => FieldError[])[],
): (fieldState: { value: ValueType }) => FieldError[] {
  return (fieldState) => {
    let fieldErrors: FieldError[] = [];

    for (const validatorFn of validatorFns) {
      const currentFieldErrors = validatorFn(fieldState);
      if (currentFieldErrors.length === 0) return [];
      fieldErrors = fieldErrors.concat(currentFieldErrors);
    }

    return [
      {
        message: fieldErrors.map(({ message }) => message).join(", "),
      },
    ];
  };
}

export default Object.freeze({
  either,
  all,
});
