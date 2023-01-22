import { compact } from "lodash";
import React, { useCallback, useEffect, useRef } from "react";
import SimpleKeyboard, { KeyboardReactInterface } from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { LetterEvaluation } from "../models/operations/evaluateAttempt";
import { KeyboardState } from "../models/operations/evaluateGameState";

import css from "./Keyboard.module.css";

export type SupportedKeyboardLayouts = "us" | "de";

type KeyboardProps = {
  layout: SupportedKeyboardLayouts;
  onSubmit: Function;
  value: string;
  onChange: (input: string) => void;
  keyboardState: KeyboardState;
  /**
   * Maps target word index to radial key segment index. Used to control which part of a key is colored according to the letter's evaluation on which target word.
   */
  segmentIndexToTargetWordMap: number[];
};

export const letters =
  "q w e r t y u i o p a s d f g h j k l z x c v b n m".split(" ");

const keyboardLayouts: Record<SupportedKeyboardLayouts, string[]> = {
  us: [
    "q w e r t y u i o p",
    "a s d f g h j k l",
    "z x c v b n m",
    "{bksp} {clear} {enter}",
  ],
  de: [
    "q w e r t z u i o p",
    "a s d f g h j k l",
    "y x c v b n m",
    "{bksp} {clear} {enter}",
  ],
};

const Keyboard: React.FC<KeyboardProps> = ({
  layout,
  onSubmit,
  value,
  onChange,
  keyboardState,
  segmentIndexToTargetWordMap,
}) => {
  const keyboardRef = useRef<KeyboardReactInterface | null>(null);

  const onKeyboardChange = useCallback(
    (newValue: string) => {
      onChange(newValue.toLocaleLowerCase());
    },
    [onChange],
  );

  useEffect(() => {
    keyboardRef.current?.setInput(value);
  }, [value]);

  const onKeyPress = (button: string) => {
    if (button === "{enter}") {
      onSubmit();
    } else if (button === "{clear}") {
      onChange("");
    }
  };

  const colors: Record<LetterEvaluation["evaluation"], string> = {
    correctPosition: "var(--ion-color-success)",
    correctLetter: "var(--ion-color-warning)",
    incorrectLetter: "var(--ion-color-step-400)",
  };

  const { numberOfWords, letterEvaluations } = keyboardState;

  const buttonAttributes: KeyboardReactInterface["options"]["buttonAttributes"] =
    compact(
      letters.map((letter) => {
        const letterEvaluation = letterEvaluations[letter];
        if (letterEvaluation?.every((value) => value === "incorrectLetter")) {
          return {
            buttons: letter,
            attribute: "style",
            value: `color: var(--ion-color-step-600); background: ${colors["incorrectLetter"]}`,
          };
        }

        const conicalBackgroundGradientStops: string[] = [];
        for (
          let segmentIndex = 0;
          segmentIndex < numberOfWords;
          segmentIndex += 1
        ) {
          const targetWordIndex = segmentIndexToTargetWordMap[segmentIndex];
          if (!letterEvaluation) break;

          const segmentEvaluation = letterEvaluation[targetWordIndex];
          const startAngle = (360 / numberOfWords) * segmentIndex;
          const endAngle = (360 / numberOfWords) * (segmentIndex + 1);

          const color = segmentEvaluation
            ? colors[segmentEvaluation]
            : "transparent";

          conicalBackgroundGradientStops.push(`${color} ${startAngle}deg`);
          conicalBackgroundGradientStops.push(`${color} ${endAngle}deg`);
        }

        if (conicalBackgroundGradientStops.length === 0) {
          return undefined;
        }

        const styleString = `background: conic-gradient(from -${
          360 / numberOfWords - 0.01
        }deg, ${conicalBackgroundGradientStops.join(",\n")});
        color: black`;

        return {
          buttons: letter,
          attribute: "style",
          value: styleString,
        };
      }),
    );

  const keyboardOptions: KeyboardReactInterface["options"] = {
    layout: {
      default: keyboardLayouts[layout],
    },
    display: {
      "{bksp}": "⌫",
      "{enter}": "⏎",
      "{clear}": "CLEAR",
    },
    theme: `hg-theme-default ${css.simpleKeyboard}`,
    onKeyPress,
    onChange,
    buttonAttributes: buttonAttributes,
  };

  return (
    <SimpleKeyboard
      {...keyboardOptions}
      onChange={onKeyboardChange}
      keyboardRef={(simpleKeyboard) => (keyboardRef.current = simpleKeyboard)}
    />
  );
};

export default Keyboard;
