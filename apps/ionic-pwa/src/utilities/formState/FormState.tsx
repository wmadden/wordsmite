import EventEmitter from "eventemitter3";
import { isEqual, mapValues, pick } from "lodash";
import blindCast from "../lang/blindCast";

export type TFieldTypes = Record<string, unknown>;

export type FormError = {
  message: string;
};
export type FieldError = {
  message: string;
};

export type FieldState<FieldValue> = {
  name: string;
  value: FieldValue;
  errors: FieldError[];
};

export type FieldStatesById<
  FieldTypes extends TFieldTypes,
  FieldIds extends keyof FieldTypes = keyof FieldTypes,
> = {
  [FieldId in FieldIds]: FieldState<FieldTypes[FieldId]>;
};

type FormValidator<FieldTypes extends TFieldTypes> = (
  values: FieldTypes,
) => FormError[];

export type FormStateInitializer<FieldTypes extends TFieldTypes> = {
  initial: {
    [FieldId in keyof FieldTypes]: FieldTypes[FieldId];
  };
  validate?: {
    form?: FormValidator<FieldTypes>;
    fields?: Partial<{
      [FieldId in keyof FieldTypes]: (
        fieldState: FieldState<FieldTypes[FieldId]>,
      ) => FieldError[];
    }>;
  };
};

function noopValidator() {
  return [];
}

export type FieldValidator<FieldValue> = (
  fieldState: FieldState<FieldValue>,
) => FieldError[];

export type FieldValidators<FieldTypes extends TFieldTypes> = Partial<{
  [FieldId in keyof FieldTypes]: FieldValidator<FieldTypes[FieldId]>;
}>;

export type FormErrors<FieldTypes extends TFieldTypes> = {
  count: number;
  form: FormError[];
  fields: {
    [FieldId in keyof FieldTypes]: FieldError[];
  };
};

export interface FormStateUpdateMethods<FieldTypes extends TFieldTypes> {
  updateFieldState<FieldId extends keyof FieldTypes>(
    fieldId: FieldId,
    newFieldState: Partial<FieldState<FieldTypes[FieldId]>>,
  ): void;

  clearErrors(): void;

  subscribe(event: keyof FieldTypes | "formErrors", listener: () => void): void;

  unsubscribe(
    event: keyof FieldTypes | "formErrors",
    listener: () => void,
  ): void;

  validateAll(): void;

  validateField<FieldId extends keyof FieldTypes>(fieldId: FieldId): void;

  setFormErrors(formErrors: FormError[]): void;
}

function makeInitialFieldStatesById<FieldTypes extends TFieldTypes>(
  initialFieldValues: FieldTypes,
): {
  [FieldId in keyof FieldTypes]: FieldState<FieldTypes[FieldId]>;
} {
  const fieldStatesById: Record<string, FieldState<unknown>> = {};

  for (const [fieldId, initialValue] of Object.entries(initialFieldValues)) {
    const fieldState: FieldState<unknown> = {
      name: fieldId,
      value: initialValue,
      errors: [],
    };
    fieldStatesById[fieldId] = Object.freeze(fieldState);
  }

  return blindCast<
    {
      [FieldId in keyof FieldTypes]: FieldState<FieldTypes[FieldId]>;
    },
    "This is built in the preceding loop. Its keys come from the initial values dictionary - which defines `FieldTypes` - so they're guaranteed to be correct. The values are typed as `FieldState`, but it's very difficult to type the loop in a way that preserves the relationship between the key and the value type, i.e. the `value` property of the FieldState at a particular key should match the _type_ of the initial value for that key."
  >(fieldStatesById);
}

export default class FormState<FieldTypes extends TFieldTypes>
  implements FormStateUpdateMethods<FieldTypes>
{
  private eventEmitter: EventEmitter;

  private fieldStatesById: {
    [FieldId in keyof FieldTypes]: FieldState<FieldTypes[FieldId]>;
  };

  private formValidator: FormValidator<FieldTypes>;

  private fieldValidators: FieldValidators<FieldTypes>;

  private formErrors: FormError[] = [];

  constructor(formStateInitializer: FormStateInitializer<FieldTypes>) {
    const { initial, validate } = formStateInitializer;

    this.eventEmitter = new EventEmitter();
    this.fieldStatesById = makeInitialFieldStatesById(initial);
    this.formValidator = validate?.form || noopValidator;

    this.fieldValidators = mapValues(initial, (_initialValue, key) => {
      const fieldId = key as keyof FieldTypes;
      const fieldValidators = validate?.fields;
      if (!fieldValidators) return noopValidator;
      return fieldValidators[fieldId];
    });
  }

  updateFieldState<FieldId extends keyof FieldTypes>(
    fieldId: FieldId,
    newFieldState: Partial<FieldState<FieldTypes[FieldId]>>,
  ): void {
    this.fieldStatesById[fieldId] = Object.freeze({
      ...this.fieldStatesById[fieldId],
      ...newFieldState,
    });

    this.eventEmitter.emit(`change.${fieldId as string}`);
  }

  validateField<FieldId extends keyof FieldTypes>(fieldId: FieldId): void {
    const currentFieldState: FieldState<FieldTypes[FieldId]> = blindCast<
      FieldState<FieldTypes[FieldId]>,
      "types must match"
    >(this.fieldStatesById[fieldId]);

    const fieldValidator: FieldValidator<FieldTypes[FieldId]> =
      this.fieldValidators[fieldId] || noopValidator;

    const errors = fieldValidator(currentFieldState);

    if (isEqual(currentFieldState.errors, errors)) return;

    this.updateFieldState(fieldId, { errors });
  }

  subscribe(
    event: keyof FieldTypes | "formErrors",
    listener: () => void,
  ): void {
    this.eventEmitter.on(`change.${event as string}`, listener);
  }

  unsubscribe(
    event: keyof FieldTypes | "formErrors",
    listener: () => void,
  ): void {
    this.eventEmitter.off(`change.${event as string}`, listener);
  }

  getAllFieldStates(): {
    [FieldId in keyof FieldTypes]: FieldState<FieldTypes[FieldId]>;
  } {
    return { ...this.fieldStatesById };
  }

  getFieldState<FieldId extends keyof FieldTypes>(
    fieldId: FieldId,
  ): FieldState<FieldTypes[FieldId]> {
    return this.fieldStatesById[fieldId];
  }

  getFieldIds(): (keyof FieldTypes)[] {
    return Object.keys(this.fieldStatesById);
  }

  getFieldStates<FieldIds extends keyof FieldTypes>(
    fieldIds: FieldIds[],
  ): FieldStatesById<FieldTypes, FieldIds> {
    return pick(this.fieldStatesById, fieldIds);
  }

  getFieldValues(): FieldTypes {
    const fieldValues: Record<string, unknown> = {};
    for (const [fieldId, fieldState] of Object.entries(this.fieldStatesById)) {
      fieldValues[fieldId] = fieldState.value;
    }
    return blindCast<
      FieldTypes,
      "no way to indicate correct type in preceding loop"
    >(fieldValues);
  }

  isValid(): boolean {
    return this.getErrors().count === 0;
  }

  validateAll(): void {
    this.setFormErrors(this.formValidator(this.getFieldValues()));
    for (const fieldId of Object.keys(this.fieldStatesById)) {
      this.validateField(fieldId);
    }
  }

  clearErrors(): void {
    if (this.formErrors.length > 0) this.setFormErrors([]);
    for (const [fieldId, fieldState] of Object.entries(this.fieldStatesById)) {
      if (!fieldState || fieldState.errors.length === 0) continue;
      this.updateFieldState(fieldId, { errors: [] });
    }
  }

  getErrors(): FormErrors<FieldTypes> {
    let count = this.formErrors.length;

    const fieldErrors = mapValues(
      this.fieldStatesById,
      ({ errors }): FieldError[] => {
        count += errors.length;
        return [...errors];
      },
    );

    return {
      count,
      form: [...this.formErrors],
      fields: fieldErrors,
    };
  }

  setFormErrors(formErrors: FormError[]): void {
    this.formErrors = formErrors;
    this.eventEmitter.emit("change.formErrors");
  }
}
