import { IonInput, IonItem, IonLabel, isPlatform } from "@ionic/react";
import React, {
  ComponentProps,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { FieldInputProps } from "../../utilities/formState/useFieldInputs";
import usePrevious from "../../utilities/hooks/usePrevious";
import { IonicBlurHandler } from "../../utilities/ionic/IonicBlurHandler";
import { IonicChangeHandler } from "../../utilities/ionic/IonicChangeHandler";
import FormFieldErrors from "./FormFieldErrors";

export type FormNumberInputProps = Omit<
  React.ComponentProps<typeof IonInput>,
  "onIonChange" | "onIonBlur" | "onChange" | "onBlur" | "value"
> & {
  lines?: ComponentProps<typeof IonItem>["lines"];
  label: string;
  labelPosition?: "fixed" | "floating" | "stacked";
} & FieldInputProps<number>;

function formatValue(value: number): string {
  return value?.toString();
}

// TODO: support parsing numbers with locale-specific thousand and decimal separators

function FormNumberInput({
  onChange,
  onBlur,
  errors,
  label,
  value: valueProp,
  lines,
  labelPosition,
  ...restProps
}: PropsWithChildren<FormNumberInputProps>): ReactElement | null {
  const [currentDisplayValue, setCurrentDisplayValue] = useState(valueProp);
  const [currentDisplayString, setCurrentDisplayString] = useState(
    formatValue(valueProp),
  );
  const previousValueProp = usePrevious(valueProp);

  useEffect(() => {
    if (valueProp !== previousValueProp && currentDisplayValue !== valueProp) {
      setCurrentDisplayValue(valueProp);
      setCurrentDisplayString(formatValue(valueProp));
    }
  }, [currentDisplayValue, previousValueProp, valueProp]);

  const onIonChange = useCallback<IonicChangeHandler>(
    (event) => {
      const newDisplayString = event.detail.value || "";
      if (currentDisplayString === newDisplayString) return;

      setCurrentDisplayString(newDisplayString);

      const newDisplayValue = parseFloat(newDisplayString);

      if (newDisplayValue === currentDisplayValue) return;
      if (typeof newDisplayValue === "number" && isNaN(newDisplayValue)) return;

      setCurrentDisplayValue(newDisplayValue);
      onChange(newDisplayValue);
    },
    [currentDisplayString, currentDisplayValue, onChange],
  );

  const onIonBlur = useCallback<IonicBlurHandler>(() => {
    const currentDisplayValueAsString = formatValue(currentDisplayValue);
    if (currentDisplayString !== currentDisplayValueAsString) {
      setCurrentDisplayString(currentDisplayValueAsString);
    }
    onBlur();
  }, [currentDisplayString, currentDisplayValue, onBlur]);

  const isIos = isPlatform("ios");

  return (
    <>
      <IonItem lines={lines}>
        <IonLabel
          className="ion-text-wrap ion-text-capitalize"
          position={
            labelPosition || (isPlatform("ios") ? "stacked" : "floating")
          }
        >
          {label}
        </IonLabel>
        <IonInput
          {...restProps}
          {...{ onIonChange, onIonBlur }}
          placeholder={isIos ? label : undefined}
          value={currentDisplayString}
          type="number"
        />
      </IonItem>
      <FormFieldErrors {...{ errors }} />
    </>
  );
}

export default React.memo(FormNumberInput);
