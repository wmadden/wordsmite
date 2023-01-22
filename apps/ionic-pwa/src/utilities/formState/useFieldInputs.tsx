import { uniqueId } from "lodash";
import { useRef, useState } from "react";
import usePrevious from "../../utilities/hooks/usePrevious";
import blindCast from "../../utilities/lang/blindCast";
import { FieldState, TFieldTypes } from "./FormState";
import { UseFieldStatesReturn, UseFormStateReturn } from "./useFormState";

export type FieldInputProps<FieldValue> = Readonly<
  FieldState<FieldValue> & {
    id: string;
    onChange(value: FieldValue): unknown;
    onBlur(): unknown;
  }
>;

export type UseFieldInputsReturn<FieldTypes extends TFieldTypes> = {
  [Key in keyof FieldTypes]: FieldInputProps<FieldTypes[Key]>;
};

export function useFieldInputs<
  FieldTypes extends TFieldTypes,
  FieldIds extends keyof FieldTypes,
>(
  formState: UseFormStateReturn<FieldTypes>,
  fieldStates: UseFieldStatesReturn<FieldTypes, FieldIds>,
): UseFieldInputsReturn<FieldTypes> {
  const { updateFieldState, validateField } = formState;
  const previousFieldStates = usePrevious(fieldStates);

  const [fieldIdSuffix] = useState(() => uniqueId());

  const { current: result } = useRef(
    blindCast<
      {
        [Key in keyof FieldTypes]: FieldInputProps<FieldTypes[Key]>;
      },
      "we build this empty object up into the expected type in the following loop, but there's no easy way to indicate that to the compiler"
    >({}),
  );

  for (const key of Object.keys(fieldStates)) {
    const fieldId = blindCast<
      FieldIds,
      "the keys of fieldStates are defined as FieldIds, so Object.keys() must return an array of FieldIds"
    >(key);

    const fieldState = blindCast<
      Exclude<(typeof fieldStates)[FieldIds], undefined>,
      "compiler believes this can be undefined, but it can't"
    >(fieldStates[fieldId]);

    if (previousFieldStates && fieldState === previousFieldStates[fieldId]) {
      continue;
    }

    result[fieldId] = {
      ...fieldState,
      id: `${fieldId as string}-input-${fieldIdSuffix}`,
      onChange: (value) => {
        updateFieldState(fieldId, { value, errors: [] });
      },
      onBlur: () => {
        validateField(fieldId);
      },
    };
  }

  return result;
}
