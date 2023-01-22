import { IonInput, IonItem, IonLabel, isPlatform } from "@ionic/react";
import React, { PropsWithChildren, ReactElement } from "react";
import { FieldInputProps } from "../../utilities/formState/useFieldInputs";
import FormFieldErrors from "./FormFieldErrors";
import useIonStringInputBehavior from "./useIonStringInputBehavior";

type FormOptionalNumberInputProps = Omit<
  React.ComponentProps<typeof IonInput>,
  | "onIonChange"
  | "onIonBlur"
  | "onIonInput"
  | "onChange"
  | "onBlur"
  | "value"
  | "type"
> & {
  label: string;
  labelPosition?: "fixed" | "stacked" | "floating";
} & FieldInputProps<number | null>;

function convertValueToDisplayString(value: number | null): string {
  return value?.toString() || "";
}

function convertDisplayStringToValue(displayString: string): number | null {
  const newDisplayValue =
    displayString.trim() !== "" ? parseFloat(displayString) : null;

  if (typeof newDisplayValue === "number" && Number.isNaN(newDisplayValue))
    return null;

  return newDisplayValue;
}

// TODO: support parsing numbers with locale-specific thousand and decimal separators

const FormOptionalNumberInput = ({
  onChange,
  onBlur,
  errors,
  label,
  labelPosition,
  placeholder,
  value: valueProp,
  ...restProps
}: PropsWithChildren<FormOptionalNumberInputProps>): ReactElement | null => {
  const { currentDisplayString, onIonBlur, onIonInput } =
    useIonStringInputBehavior({
      valueProp,
      onChange,

      onBlur,
      convertDisplayStringToValue,
      convertValueToDisplayString,
    });

  const isIos = isPlatform("ios");
  let showLabel;
  let placeholderValue;
  if (!(labelPosition || isIos)) {
    if (placeholder) {
      showLabel = true;
      placeholderValue = placeholder;
    } else {
      showLabel = false;
      placeholderValue = label;
    }
  } else {
    showLabel = true;
    placeholderValue = placeholder;
  }

  return (
    <>
      <IonItem lines="inset">
        {showLabel && (
          <IonLabel
            className="ion-text-wrap"
            position={labelPosition || (placeholder ? "stacked" : "floating")}
          >
            {label}
          </IonLabel>
        )}
        <IonInput
          {...restProps}
          {...{ onIonInput, onIonBlur }}
          type="number"
          placeholder={placeholderValue}
          value={currentDisplayString}
          inputmode="numeric"
        />
      </IonItem>
      <FormFieldErrors {...{ errors }} />
    </>
  );
};

export default React.memo(FormOptionalNumberInput);
