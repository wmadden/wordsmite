import { isEqual } from "lodash";

export type LetterEvaluation = {
  index: number;
  value: string;
  evaluation: "correctPosition" | "correctLetter" | "incorrectLetter";
};

const evaluateAttempt = (
  attempt: string,
  targetWord: string,
): LetterEvaluation[] => {
  const numberOfLetters = targetWord.length;
  const attemptEvaluation: LetterEvaluation[] = [];
  const targetWordArray = targetWord.split("").map((letter, i) => {
    return { index: i, value: letter };
  });
  const attemptWordArray = attempt.split("").map((letter, i) => {
    return { index: i, value: letter };
  });

  // first: find all matching columns. If found, remove both entries from respective arrays
  for (let i = 0; i < numberOfLetters; i++) {
    const targetLetter = targetWordArray.find((el) => el.index === i);
    const attemptLetter = attemptWordArray.find((el) => el.index === i);

    if (targetLetter && attemptLetter && isEqual(targetLetter, attemptLetter)) {
      attemptEvaluation.push({
        ...targetLetter,
        evaluation: "correctPosition",
      });

      const targetWordArrayIndex = targetWordArray.findIndex(
        ({ index }) => targetLetter.index === index,
      );
      targetWordArray.splice(targetWordArrayIndex, 1);

      const attemptWordArrayIndex = attemptWordArray.findIndex(
        ({ index }) => attemptLetter.index === index,
      );
      attemptWordArray.splice(attemptWordArrayIndex, 1);
    }
  }

  targetWordArray.forEach((targetLetterEntry) => {
    const targetLetter = targetLetterEntry.value;
    const attemptLetterEntry = attemptWordArray.find(
      (el) => el.value === targetLetter,
    );
    if (attemptLetterEntry) {
      attemptEvaluation.push({
        ...attemptLetterEntry,
        evaluation: "correctLetter",
      });
      attemptWordArray.splice(attemptWordArray.indexOf(attemptLetterEntry), 1);
    }
  });

  attemptWordArray.forEach((attemptedLetterEntry) => {
    attemptEvaluation.push({
      ...attemptedLetterEntry,
      evaluation: "incorrectLetter",
    });
  });

  return attemptEvaluation.sort((a, b) => a.index - b.index);
};

export default evaluateAttempt;
