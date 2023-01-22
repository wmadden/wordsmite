import {
  IonItem,
  IonLabel,
  IonNote,
  IonSelect,
  IonSelectOption,
  isPlatform,
} from "@ionic/react";
import React, {
  ComponentProps,
  PropsWithChildren,
  ReactElement,
  useCallback,
} from "react";
import { FieldInputProps } from "../../utilities/formState/useFieldInputs";
import { IonicChangeHandler } from "../../utilities/ionic/IonicChangeHandler";
import blindCast from "../../utilities/lang/blindCast";
import FormFieldErrors from "./FormFieldErrors";

export type FormSingleSelectOption<ValueType> = {
  value: ValueType;
  label: string;
};

export type FormSingleSelectProps<ValueType> = Omit<
  React.ComponentProps<typeof IonSelect>,
  "onIonChange" | "onIonBlur" | "onChange" | "onBlur"
> &
  FieldInputProps<ValueType> & {
    lines?: ComponentProps<typeof IonItem>["lines"];
    label: string;
    labelPosition?: "fixed" | "floating" | "stacked";
    helperText?: string;
    buttonLabels: { ok: string; cancel: string };
    options: readonly FormSingleSelectOption<ValueType>[];
  };

// eslint-disable-next-line react/function-component-definition
function FormSingleSelect<OptionValues>({
  onChange,
  onBlur,
  options,
  errors,
  label: selectLabel,
  labelPosition,
  helperText,
  buttonLabels,
  lines,
  ...restProps
}: PropsWithChildren<
  FormSingleSelectProps<OptionValues>
>): ReactElement | null {
  const onIonChange: IonicChangeHandler = useCallback(
    (event) => {
      onChange(
        blindCast<
          OptionValues,
          "we will only render options with values from the `options` prop so we can assume the value received here comes from one of them"
        >(event.detail.value),
      );
      onBlur();
    },
    [onBlur, onChange],
  );

  return (
    <>
      <IonItem lines={lines}>
        <IonLabel
          position={
            labelPosition || (isPlatform("ios") ? "stacked" : "floating")
          }
        >
          {selectLabel}
        </IonLabel>
        <IonSelect
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
        {helperText && <IonNote slot="helper">{helperText}</IonNote>}
      </IonItem>
      <FormFieldErrors {...{ errors }} />
    </>
  );
}

export default FormSingleSelect;
