import { IonItem, IonLabel, IonTextarea, isPlatform } from "@ionic/react";
import React from "react";
import { FieldInputProps } from "../../utilities/formState/useFieldInputs";
import FormFieldErrors from "./FormFieldErrors";
import useIonStringInputBehavior from "./useIonStringInputBehavior";

export type FormTextAreaProps = Omit<
  React.ComponentProps<typeof IonTextarea>,
  "onIonChange" | "onIonBlur" | "onIonInput" | "onChange" | "onBlur"
> &
  FieldInputProps<string> & { label: string };

function convertValueToDisplayString(value: string): string {
  return value;
}

function convertDisplayStringToValue(displayString: string): string {
  return displayString.trim();
}

const FormTextArea: React.FC<FormTextAreaProps> = ({
  onChange,
  onBlur,
  errors,
  label,
  value: valueProp,
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

  return (
    <>
      <IonItem lines="full">
        <IonLabel position={isIos ? "stacked" : "floating"}>{label}</IonLabel>
        <IonTextarea
          {...restProps}
          {...{ onIonInput, onIonBlur }}
          value={currentDisplayString}
        />
      </IonItem>
      <FormFieldErrors {...{ errors }} />
    </>
  );
};

export default React.memo(FormTextArea);
