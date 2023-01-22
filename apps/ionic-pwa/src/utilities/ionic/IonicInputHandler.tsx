import type {
  IonInputCustomEvent,
  IonTextareaCustomEvent,
} from "@ionic/core/components";

export type IonicInputHandler = (
  event: IonInputCustomEvent<InputEvent> | IonTextareaCustomEvent<InputEvent>,
) => void;
