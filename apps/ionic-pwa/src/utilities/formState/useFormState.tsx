import { isEqual } from "lodash";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useStableValue from "../hooks/useStableValue";
import blindCast from "../lang/blindCast";
import FormState, {
  FieldStatesById,
  FormError,
  FormStateInitializer,
  FormStateUpdateMethods,
  TFieldTypes,
} from "./FormState";

const formStateAccessor = Symbol("getFormState");

export type FormStateRef<FieldTypes extends TFieldTypes> = {
  [formStateAccessor]: FormState<FieldTypes>;
};
export type __TestFormStateRef__<FieldTypes extends TFieldTypes> =
  FormStateRef<FieldTypes> & { __formState__: FormState<FieldTypes> };

export type UseFormStateReturn<FieldTypes extends TFieldTypes> =
  FormStateRef<FieldTypes> & FormStateUpdateMethods<FieldTypes>;

export default function useFormState<FieldTypes extends TFieldTypes>({
  initial,
  validate,
}: FormStateInitializer<FieldTypes>): UseFormStateReturn<FieldTypes> {
  const [returnValue] = useState(() => {
    const formState = new FormState<FieldTypes>({ initial, validate });

    const formStateRef = {
      [formStateAccessor]: formState,
    };

    if (process.env.NODE_ENV === "test") {
      Object.assign(formStateRef, { __formState__: formState });
    }

    return Object.freeze({
      ...formStateRef,
      subscribe: formState.subscribe.bind(formState),
      unsubscribe: formState.unsubscribe.bind(formState),
      clearErrors: formState.clearErrors.bind(formState),
      updateFieldState: formState.updateFieldState.bind(formState),
      validateAll: formState.validateAll.bind(formState),
      validateField: formState.validateField.bind(formState),
      setFormErrors: formState.setFormErrors.bind(formState),
    });
  });

  return returnValue;
}

export type UseFieldStatesReturn<
  FieldTypes extends TFieldTypes,
  FieldIds extends keyof FieldTypes,
> = FieldStatesById<FieldTypes, FieldIds>;

export function useFieldStates<FieldTypes extends TFieldTypes>(
  formStateRef: UseFormStateReturn<FieldTypes>,
): UseFieldStatesReturn<FieldTypes, keyof FieldTypes>;
export function useFieldStates<
  FieldTypes extends TFieldTypes,
  FieldIds extends keyof FieldTypes,
>(
  formStateRef: UseFormStateReturn<FieldTypes>,
  fields: FieldIds[],
): UseFieldStatesReturn<FieldTypes, FieldIds>;
export function useFieldStates<
  FieldTypes extends TFieldTypes,
  FieldIds extends keyof FieldTypes,
>(
  formStateRef: UseFormStateReturn<FieldTypes>,
  fields?: FieldIds[],
): UseFieldStatesReturn<FieldTypes, FieldIds> {
  const formState = formStateRef[formStateAccessor];

  const targetFields = useStableValue(
    fields ||
      blindCast<
        FieldIds[],
        "if specific field IDs aren't provided, this will give the list of all fields which is guaranteed to be the correct type"
      >(formState.getFieldIds()),
    isEqual,
  );

  const [fieldStates, setFieldStates] = useState(
    formState.getFieldStates(targetFields),
  );

  const updateFieldStates = useCallback(() => {
    setFieldStates(formState.getFieldStates(targetFields));
  }, [targetFields, formState]);

  useEffect(() => {
    targetFields.forEach((fieldId) =>
      formState.subscribe(fieldId, updateFieldStates),
    );

    return () => {
      targetFields.forEach((fieldId) =>
        formState.unsubscribe(fieldId, updateFieldStates),
      );
    };
  }, [targetFields, formState, updateFieldStates]);

  return Object.freeze(fieldStates);
}

type UseFormReturn = {
  form: {
    onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  };
  submit(): void;
};

export function useForm<FieldTypes extends TFieldTypes>(
  formStateRef: FormStateRef<FieldTypes>,
  {
    onSubmit: onSubmitHandler,
  }: {
    onSubmit: (values: FieldTypes) => void;
  },
): UseFormReturn {
  const formState = formStateRef[formStateAccessor];
  const formElementRef = useRef<HTMLFormElement | null>(null);

  const submit = useCallback(() => {
    formState.validateAll();
    const formElement = formElementRef.current;
    const htmlFormIsValid = formElement ? formElement.checkValidity() : true;
    const formIsValid = formState.isValid() && htmlFormIsValid;

    if (formIsValid) {
      onSubmitHandler(formState.getFieldValues());
    }
  }, [formState, onSubmitHandler]);

  const onSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      submit();
    },
    [submit],
  );

  const result: UseFormReturn = useMemo(
    () => ({
      form: { onSubmit },
      submit,
    }),
    [onSubmit, submit],
  );

  return result;
}

type UseFormErrorsReturn = {
  formErrors: readonly FormError[];
};

export function useFormErrors<FieldTypes extends TFieldTypes>(
  formStateRef: FormStateRef<FieldTypes>,
): UseFormErrorsReturn {
  const formState = formStateRef[formStateAccessor];
  const [formErrors, setFormErrors] = useState(() =>
    Object.freeze([...formState.getErrors().form]),
  );

  useEffect(() => {
    const listener = () => {
      const newFormErrors = Object.freeze(formState.getErrors().form);
      setFormErrors(newFormErrors);
    };
    formState.subscribe("formErrors", listener);
    return () => formState.unsubscribe("formErrors", listener);
  });

  return useMemo(() => Object.freeze({ formErrors }), [formErrors]);
}
