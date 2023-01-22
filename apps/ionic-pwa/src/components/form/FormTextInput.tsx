import { IonInput, IonItem, IonLabel, isPlatform } from "@ionic/react";
import React from "react";
import { FieldInputProps } from "../../utilities/formState/useFieldInputs";
import FormFieldErrors from "./FormFieldErrors";
import useIonStringInputBehavior from "./useIonStringInputBehavior";

export type FormTextInputProps = Omit<
  React.ComponentProps<typeof IonInput>,
  "onIonChange" | "onIonBlur" | "onIonInput" | "onChange" | "onBlur" | "ref"
> &
  FieldInputProps<string> & {
    label: string;
    labelPosition?: "fixed" | "stacked" | "floating";
    insetItem?: boolean;
    ionItemProps?: React.ComponentProps<typeof IonItem>;
  };

function convertValueToDisplayString(value: string): string {
  return value;
}

function convertDisplayStringToValue(displayString: string): string {
  return displayString.trim();
}

const FormTextInput = React.forwardRef<HTMLIonInputElement, FormTextInputProps>(
  (
    {
      onChange,
      onBlur,
      errors,
      label,
      labelPosition,
      insetItem,
      value: valueProp,
      placeholder,
      ionItemProps,
      ...restProps
    },
    ref,
  ) => {
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

    const isItemInset = typeof insetItem === "undefined" ? true : insetItem;

    return (
      <>
        <IonItem
          lines="inset"
          className={isItemInset ? "" : "ion-no-padding"}
          {...ionItemProps}
        >
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
            {...{ onIonInput, onIonBlur, ref }}
            placeholder={placeholderValue}
            value={currentDisplayString}
          />
        </IonItem>
        <FormFieldErrors {...{ errors }} />
      </>
    );
  },
);

export default React.memo(FormTextInput);
