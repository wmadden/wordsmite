import FormState, { TFieldTypes } from "../FormState";
import { FormStateRef, __TestFormStateRef__ } from "../useFormState";

export default function formStateFromRef<FieldTypes extends TFieldTypes>(
  formStateRef: FormStateRef<FieldTypes>,
): FormState<FieldTypes> {
  return (formStateRef as __TestFormStateRef__<FieldTypes>).__formState__;
}
