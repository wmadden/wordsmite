import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  isPlatform,
  SelectChangeEventDetail,
} from "@ionic/react";
import React, { PropsWithChildren, ReactElement, useCallback } from "react";
import { FieldInputProps } from "../../utilities/formState/useFieldInputs";
import FormFieldErrors from "./FormFieldErrors";
import { FormSingleSelectOption } from "./FormSingleSelect";

export type FormMultipleSelectProps<ValueType> = Omit<
  React.ComponentProps<typeof IonSelect>,
  "onIonChange" | "onIonBlur" | "onChange" | "onBlur"
> &
  FieldInputProps<ValueType[]> & {
    label: string;
    buttonLabels: { ok: string; cancel: string };
    labelPosition?: "fixed" | "stacked" | "floating";
    options: readonly FormSingleSelectOption<ValueType>[];
  };

type IonicMultipleSelectChangeHandler<T> = (
  event: CustomEvent<SelectChangeEventDetail<T>>,
) => void;

// eslint-disable-next-line react/function-component-definition
function FormMultipleSelect<ValueType>({
  onChange,
  onBlur,
  options,
  errors,
  label: selectLabel,
  buttonLabels,
  labelPosition,
  ...restProps
}: PropsWithChildren<FormMultipleSelectProps<ValueType>>): ReactElement | null {
  const onIonChange: IonicMultipleSelectChangeHandler<ValueType[]> =
    useCallback(
      (event) => {
        onChange(event.detail.value);
        onBlur();
      },
      [onBlur, onChange],
    );

  return (
    <>
      <IonItem lines="inset">
        <IonLabel
          position={
            labelPosition || (isPlatform("ios") ? "stacked" : "floating")
          }
        >
          {selectLabel}
        </IonLabel>
        <IonSelect
          multiple
          {...restProps}
          {...{ onIonChange }}
          onIonBlur={onBlur}
          okText={buttonLabels.ok}
          cancelText={buttonLabels.cancel}
        >
          {options.map(({ label, value }) => (
            <IonSelectOption value={value} key={String(value)}>
              {label}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
      <FormFieldErrors {...{ errors }} />
    </>
  );
}

export default FormMultipleSelect;
