import { useCallback, useEffect, useState } from "react";
import usePrevious from "../../utilities/hooks/usePrevious";
import { IonicBlurHandler } from "../../utilities/ionic/IonicBlurHandler";
import { IonicInputHandler } from "../../utilities/ionic/IonicInputHandler";
import blindCast from "../../utilities/lang/blindCast";

type UseIonStringInputBehaviorOptions<T> = {
  convertDisplayStringToValue(displayString: string): T;
  convertValueToDisplayString(value: T): string;
  onChange(value: T): void;
  onBlur(): void;
  valueProp: T;
};

type UseIonStringInputBehaviorReturn<T> = {
  onIonInput: IonicInputHandler;
  onIonBlur: IonicBlurHandler;
  currentDisplayValue: T;
  currentDisplayString: string;
};

export default function useIonStringInputBehavior<T>({
  valueProp,
  convertDisplayStringToValue,
  convertValueToDisplayString,
  onChange,
  onBlur,
}: UseIonStringInputBehaviorOptions<T>): UseIonStringInputBehaviorReturn<T> {
  const [currentDisplayValue, setCurrentDisplayValue] = useState(valueProp);
  const [currentDisplayString, setCurrentDisplayString] = useState(
    convertValueToDisplayString(valueProp),
  );
  const previousValueProp = usePrevious(valueProp);

  useEffect(() => {
    const valuePropWasUpdated =
      valueProp !== previousValueProp && currentDisplayValue !== valueProp;
    if (valuePropWasUpdated) {
      setCurrentDisplayValue(valueProp);
      setCurrentDisplayString(convertValueToDisplayString(valueProp));
    }
  }, [
    convertValueToDisplayString,
    currentDisplayValue,
    previousValueProp,
    valueProp,
  ]);

  const onIonInput = useCallback<IonicInputHandler>(
    (ionInputEvent) => {
      const newDisplayString = blindCast<
        HTMLInputElement,
        "IonInput will dispatch keyboard events from the underlying HTMLInputElement"
      >(ionInputEvent.currentTarget).value;

      if (currentDisplayString === newDisplayString) return;

      setCurrentDisplayString(newDisplayString);

      let newDisplayValue;
      try {
        newDisplayValue = convertDisplayStringToValue(newDisplayString);
      } catch (e) {
        return;
      }

      if (newDisplayValue === currentDisplayValue) return;

      setCurrentDisplayValue(newDisplayValue);
      onChange(newDisplayValue);
    },
    [
      convertDisplayStringToValue,
      currentDisplayString,
      currentDisplayValue,
      onChange,
    ],
  );

  const onIonBlur = useCallback<IonicBlurHandler>(() => {
    const currentDisplayValueAsString =
      convertValueToDisplayString(currentDisplayValue);

    if (currentDisplayString !== currentDisplayValueAsString) {
      setCurrentDisplayString(currentDisplayValueAsString);
    }
    onBlur();
  }, [
    convertValueToDisplayString,
    currentDisplayString,
    currentDisplayValue,
    onBlur,
  ]);

  return {
    onIonInput,
    onIonBlur,
    currentDisplayValue,
    currentDisplayString,
  };
}
