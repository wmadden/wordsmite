import assertExhausted from "../../utilities/lang/assertExhausted";
import { Game } from "../Game";
import { GameState } from "../GameState";
import evaluateAttempt, { LetterEvaluation } from "./evaluateAttempt";

export type KeyboardState = {
  numberOfWords: number;
  letterEvaluations: Record<
    string,
    (LetterEvaluation["evaluation"] | undefined)[]
  >;
};

type EvaluatedGameState = {
  completed: boolean;
  keyboardState: KeyboardState;
};

export default function evaluateGameState(
  game: Game,
  gameState: GameState,
): EvaluatedGameState {
  const { targetWords } = game;
  const { attempts } = gameState;
  const maxAttempts = targetWords.length + 5;
  const completed =
    attempts.length === maxAttempts ||
    targetWords.every((targetWord) =>
      attempts.find(({ value }) => value === targetWord),
    );

  const keyboardState: KeyboardState = {
    numberOfWords: targetWords.length,
    letterEvaluations: {},
  };

  targetWords.forEach((targetWord, targetWordIndex) => {
    const correctAttempt = attempts.find(
      (attempt) => attempt.value === targetWord,
    );
    for (const attempt of attempts) {
      const attemptEvaluation = evaluateAttempt(attempt.value, targetWord);

      for (const letterEvaluation of attemptEvaluation) {
        const letter = letterEvaluation.value;
        let letterEvaluationsPerTargetWord =
          keyboardState.letterEvaluations[letter];

        if (!letterEvaluationsPerTargetWord) {
          letterEvaluationsPerTargetWord = [];
          keyboardState.letterEvaluations[letter] =
            letterEvaluationsPerTargetWord;
        }

        if (correctAttempt) {
          letterEvaluationsPerTargetWord[targetWordIndex] = "incorrectLetter";
          continue;
        }

        const currentValue = letterEvaluationsPerTargetWord[targetWordIndex];
        const newValue = letterEvaluation.evaluation;

        if (newValue === "incorrectLetter") {
          if (!currentValue)
            letterEvaluationsPerTargetWord[targetWordIndex] = newValue;
        } else if (newValue === "correctLetter") {
          if (!currentValue || currentValue === "incorrectLetter")
            letterEvaluationsPerTargetWord[targetWordIndex] = newValue;
        } else if (newValue === "correctPosition") {
          if (
            !currentValue ||
            currentValue === "incorrectLetter" ||
            currentValue === "correctLetter"
          )
            letterEvaluationsPerTargetWord[targetWordIndex] = newValue;
        } else {
          assertExhausted(newValue);
        }
      }
    }
  });

  return { keyboardState, completed };
}
