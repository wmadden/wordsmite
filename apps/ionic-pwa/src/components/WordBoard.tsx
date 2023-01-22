import React from "react";
import { Attempt } from "../models/GameState";
import evaluateAttempt from "../models/operations/evaluateAttempt";

import css from "./WordBoard.module.css";

type LetterDisplayProps =
  | {
      letter: string;
      evaluation: "incorrectLetter" | "correctPosition" | "correctLetter";
      status: "previousAttempt";
    }
  | {
      letter: string;
      evaluation: "unknown";
      status: "currentAttempt";
    };

const LetterDisplay: React.FC<LetterDisplayProps> = ({
  letter,
  evaluation,
  status,
}) => (
  <div className={`${css.letterDisplay} ${css[evaluation]} ${css[status]}`}>
    {letter}
  </div>
);

type PreviousAttemptRowProps = {
  attempt: string;
  targetWord: string;
};

const PreviousAttemptRow: React.FC<PreviousAttemptRowProps> = ({
  attempt,
  targetWord,
}) => {
  const attemptEvaluation = evaluateAttempt(attempt, targetWord);

  return (
    <>
      {attemptEvaluation.map(({ value, evaluation }, i) => {
        return (
          <LetterDisplay
            key={i}
            letter={value}
            evaluation={evaluation}
            status="previousAttempt"
          />
        );
      })}
    </>
  );
};

type CurrentAttemptRowProps = {
  attempt: string;
  targetWordLength: number;
};

const CurrentAttemptRow: React.FC<CurrentAttemptRowProps> = ({
  attempt,
  targetWordLength,
}) => (
  <>
    {Array(targetWordLength)
      .fill(0)
      .map((_, i) => (
        <LetterDisplay
          key={i}
          letter={attempt[i]}
          evaluation="unknown"
          status="currentAttempt"
        />
      ))}
  </>
);

type EmptyRowProps = {
  className: string;
};

const EmptyRow: React.FC<EmptyRowProps> = ({ className }) => (
  <div className={`${css.emptyRow} ${className}`} />
);

export default function WordBoard({
  maxAttempts,
  targetWord,
  attempts,
  currentAttempt,
}: {
  targetWord: string;
  maxAttempts: number;
  attempts: Attempt[];
  currentAttempt: string;
}): JSX.Element {
  const turns = Array(maxAttempts).fill(0);
  const targetWordLength = targetWord.length;
  const currentTurn = attempts.length;
  const correctAttemptIndex = attempts.findIndex(
    (attempt) => attempt.value === targetWord,
  );

  function renderCompletedBoard() {
    return turns.map((_, turn) => (
      <div key={turn} className={css.wordRow}>
        {turn <= correctAttemptIndex && (
          <PreviousAttemptRow
            attempt={attempts[turn].value}
            targetWord={targetWord}
          />
        )}
        {turn > correctAttemptIndex && turn <= currentTurn && (
          <EmptyRow
            className={turn < currentTurn ? css.previous : css.current}
          />
        )}
        {turn > correctAttemptIndex && turn > currentTurn && (
          <EmptyRow className={css.future} />
        )}
      </div>
    ));
  }

  function renderIncompleteBoard() {
    return turns.map((_, turn) => (
      <div key={turn} className={css.wordRow}>
        {turn < currentTurn && attempts[turn] && (
          <PreviousAttemptRow
            attempt={attempts[turn].value}
            targetWord={targetWord}
          />
        )}
        {turn === currentTurn && (
          <CurrentAttemptRow
            attempt={currentAttempt}
            targetWordLength={targetWordLength}
          />
        )}
        {turn > currentTurn && <EmptyRow className={css.future} />}
      </div>
    ));
  }

  return (
    <div className={css.wordBoard}>
      {correctAttemptIndex !== -1
        ? renderCompletedBoard()
        : renderIncompleteBoard()}
    </div>
  );
}
