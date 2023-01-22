import { IonInput, IonItem, IonLabel, isPlatform } from "@ionic/react";
import React from "react";
import { FieldInputProps } from "../../utilities/formState/useFieldInputs";
import FormFieldErrors from "./FormFieldErrors";
import useIonStringInputBehavior from "./useIonStringInputBehavior";

export type FormOptionalTextInputProps = Omit<
  React.ComponentProps<typeof IonInput>,
  "onIonChange" | "onIonBlur" | "onIonInput" | "onChange" | "onBlur"
> &
  FieldInputProps<string | null> & { label: string };

function convertValueToDisplayString(value: string | null): string {
  return value ?? "";
}

function convertDisplayStringToValue(displayString: string): string | null {
  return displayString.trim().length > 0 ? displayString.trim() : null;
}

const FormOptionalTextInput: React.FC<FormOptionalTextInputProps> = ({
  onChange,
  onBlur,
  errors,
  label,
  value: valueProp,
  placeholder,
  ...restProps
}) => {
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
  if (isIos) {
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
            position={placeholder ? "stacked" : "floating"}
          >
            {label}
          </IonLabel>
        )}
        <IonInput
          {...restProps}
          {...{ onIonInput, onIonBlur }}
          placeholder={placeholderValue}
          value={currentDisplayString}
        />
      </IonItem>
      <FormFieldErrors {...{ errors }} />
    </>
  );
};

export default React.memo(FormOptionalTextInput);
