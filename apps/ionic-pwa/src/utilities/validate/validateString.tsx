import {
  FieldError,
  FieldValidator,
} from "../../utilities/formState/FormState";
import assertPresent from "../../utilities/lang/assertPresent";

export function length(
  options: {
    min: number;
  },
  t: {
    characterMinimum: (min: number) => string;
  },
): ({ value }: { value: string }) => FieldError[];
export function length(
  options: {
    max: number;
  },
  t: {
    characterMaximum: (max: number) => string;
  },
): ({ value }: { value: string }) => FieldError[];
export function length(
  options: {
    min: number;
    max: number;
  },
  t: {
    characterMinimum: (min: number) => string;
    characterMaximum: (max: number) => string;
  },
): ({ value }: { value: string }) => FieldError[];
export function length(
  {
    min,
    max,
  }: {
    min?: number;
    max?: number;
  },
  t: {
    characterMinimum?: (characterMinimum: number) => string;
    characterMaximum?: (characterMaximum: number) => string;
  },
): ({ value }: { value: string }) => FieldError[] {
  return ({ value }) => {
    if (min === undefined && max === undefined) {
      return [];
    }
    const errors: FieldError[] = [];
    if (min !== undefined && value.length < min) {
      const characterMinimum = assertPresent.andReturn(t.characterMinimum, {
        because:
          "overload signature enforces translation present if min present",
      });
      errors.push({ message: characterMinimum(min) });
    }
    if (max !== undefined && value.length > max) {
      const characterMaximum = assertPresent.andReturn(t.characterMaximum, {
        because:
          "overload signature enforces translation present if max present",
      });
      errors.push({ message: characterMaximum(max) });
    }
    return errors;
  };
}

export function isPresent(t: {
  isRequired: string;
}): ({ value }: { value: string }) => FieldError[] {
  return ({ value }) => {
    if (value.length === 0) {
      return [{ message: t.isRequired }];
    }
    return [];
  };
}

export function matches(
  { pattern }: { pattern(): RegExp | string },
  t: { mustEqual: string },
): FieldValidator<string> {
  return ({ value }) => {
    if (!value.match(pattern())) {
      return [{ message: t.mustEqual }];
    }
    return [];
  };
}

// https://github.com/jquense/yup/blob/03584f6758ff43409113c41f58fd41e065aa18a3/src/string.ts#L9
const emailRegexp =
  // eslint-disable-next-line no-control-regex,no-useless-escape
  /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

export function isEmail(t: {
  validEmailAddress: string;
}): ({ value }: { value: string }) => FieldError[] {
  return ({ value }) => {
    if (!value.match(emailRegexp)) {
      return [{ message: t.validEmailAddress }];
    }
    return [];
  };
}

export default Object.freeze({
  length,
  isPresent,
  isEmail,
});
