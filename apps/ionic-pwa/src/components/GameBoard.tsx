import { useIonToast } from "@ionic/react";
import { QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import React, { useState } from "react";
import FiveLetterWords from "../data/FiveLetterWords";
import { Game } from "../models/Game";
import { GameState } from "../models/GameState";
import createAttempt from "../models/operations/createAttempt";
import evaluateGameState from "../models/operations/evaluateGameState";
import Keyboard from "./Keyboard";
import WordBoard from "./WordBoard";

import css from "./GameBoard.module.css";

type GameBoardProps = {
  game: Game;
  gameStateDoc: QueryDocumentSnapshot<GameState>;
  readonly: boolean;
};

const GameBoard: React.FC<GameBoardProps> = ({
  game,
  gameStateDoc,
  readonly,
}) => {
  const targetWordLength = 5;
  const attempts = gameStateDoc.data().attempts;
  const maxAttempts = game.targetWords.length + 5;
  const [currentAttempt, setCurrentAttempt] = useState<string>("");
  const [presentToast] = useIonToast();

  const onChange = (input: string) => {
    if (input.length <= targetWordLength) {
      setCurrentAttempt(input);
    }
  };

  const onSubmit = () => {
    if (!FiveLetterWords.has(currentAttempt)) {
      presentToast({
        message: "That's not in the dictionary",
        color: "danger",
        duration: 2000,
      });
      return;
    }
    if (currentAttempt.length === targetWordLength) {
      const newAttempt = {
        value: currentAttempt,
        createdAt: Timestamp.fromDate(new Date()),
      };
      createAttempt({ gameState: gameStateDoc, newAttempt });
      setCurrentAttempt("");
    }
  };

  const { keyboardState, completed } = evaluateGameState(
    game,
    gameStateDoc.data(),
  );

  return (
    <div className={css.gameBoard}>
      <div className={css.gameGrid}>
        {game.targetWords.map((targetWord) => (
          <WordBoard
            key={targetWord}
            {...{
              targetWord,
              maxAttempts: completed ? attempts.length : maxAttempts,
              attempts,
              currentAttempt,
            }}
          />
        ))}
      </div>

      {!readonly && !completed && (
        <Keyboard
          layout="us"
          onSubmit={onSubmit}
          value={currentAttempt}
          onChange={onChange}
          keyboardState={keyboardState}
          segmentIndexToTargetWordMap={[0, 1, 3, 2]}
        />
      )}
    </div>
  );
};

export default GameBoard;
