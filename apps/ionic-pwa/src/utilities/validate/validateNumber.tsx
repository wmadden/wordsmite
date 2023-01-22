import { FieldError } from "../../utilities/formState/FormState";

export function within(
  options: {
    min: number;
    max: number;
  },
  t: {
    numberMinimum: (min: number) => string;
    numberMaximum: (max: number) => string;
  },
): (fieldState: { value: number }) => FieldError[] {
  const { min, max } = options;

  return ({ value }) => {
    if (value < min) {
      return [{ message: t.numberMinimum(min) }];
    }

    if (value > max) {
      return [{ message: t.numberMaximum(max) }];
    }

    return [];
  };
}

export function over(
  options: {
    min: number;
  },
  t: { numberMinimum: (min: number) => string },
): (fieldState: { value: number }) => FieldError[] {
  const { min } = options;

  return ({ value }) => {
    if (value <= min) {
      return [{ message: t.numberMinimum(min) }];
    }

    return [];
  };
}

export function isInteger(t: {
  mustBeWholeNumber: string;
}): (fieldState: { value: number }) => FieldError[] {
  return ({ value }) => {
    if (value % 1 !== 0) {
      return [{ message: t.mustBeWholeNumber }];
    }

    return [];
  };
}

export default Object.freeze({
  within,
  over,
});
