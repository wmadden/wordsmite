import { IonButton, IonIcon, useIonToast } from "@ionic/react";
import classNames from "classnames";
import {
  addDoc,
  collection,
  QueryDocumentSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { flash } from "ionicons/icons";
import React, { useCallback, useMemo } from "react";
import { useFirestore } from "reactfire";
import { gameEventsCollectionPath } from "../../firebase/firestorePathBuilders";
import GameEventConverter from "../../models/dataConverters/GameEventConverter";
import {
  ActionType,
  Boom,
  CellCoordinate,
  Game,
  GameEvent,
  gameEventRollupAll,
  GameState,
} from "../../models/Game";
import GameBoard from "./GameBoard";
import css from "./GameInProgress.module.css";
import useHighlightedCellsState from "./useHighlightedCellsState";

export type GameInProgressProps = {
  game: QueryDocumentSnapshot<Game>;
  authUserId: string;
  targetPlayerId: string;
  className?: string;
  gameEvents: QueryDocumentSnapshot<GameEvent>[];
};

const alphabet = [..."abcdefghijklmnopqrstuvwxyz"];

function countHits(gameState: GameState): number {
  let result = 0;
  for (let row = 0; row < gameState.grid.length; row += 1) {
    for (let col = 0; col < gameState.grid[row].length; col += 1) {
      const cell = gameState.grid[row][col];
      result += cell.hits;
    }
  }
  return result;
}

const GameInProgress: React.FC<GameInProgressProps> = ({
  game,
  className,
  targetPlayerId,
  authUserId,
  gameEvents,
}) => {
  const firestore = useFirestore();

  const gameState: GameState | undefined = useMemo(() => {
    return gameEventRollupAll(
      game.data(),
      authUserId,
      gameEvents.map((doc) => doc.data()),
    );
  }, [authUserId, game, gameEvents]);

  const [presentToast] = useIonToast();
  const onWordHighlighted = useCallback(
    ({
      word,
      highlightedCells,
    }: {
      word: string;
      highlightedCells: CellCoordinate[];
    }): void => {
      if (gameState.words.includes(word)) return;
      addDoc(
        collection(
          firestore,
          gameEventsCollectionPath({ gameId: game.id }),
        ).withConverter(GameEventConverter),
        {
          action: {
            type: ActionType.MAKE_WORD,
            word,
            letterPositions: highlightedCells,
          },
          createdAt: serverTimestamp(),
          targetPlayerId,
          creatorId: authUserId,
          // currentState: gameState,
        },
      );

      presentToast({
        message: `Found a word: ${word}!`,
        color: "success",
        duration: 1500,
      });
    },
    [
      authUserId,
      firestore,
      game.id,
      gameState.words,
      presentToast,
      targetPlayerId,
    ],
  );

  const highlightedCellsState = useHighlightedCellsState({
    gameState,
    onWordHighlighted,
  });

  const onDetonateClick = useCallback(() => {
    const boomCells = gameState.grid.flatMap((row, i) =>
      row.flatMap((cell, j) => (cell.hits > 0 ? [{ row: i, col: j }] : [])),
    );
    const replacements: Boom[] = boomCells.map((cellCoordinate) => ({
      pos: cellCoordinate,
      letter: alphabet[Math.floor(Math.random() * alphabet.length)],
    }));

    addDoc(
      collection(
        firestore,
        gameEventsCollectionPath({ gameId: game.id }),
      ).withConverter(GameEventConverter),
      {
        action: {
          type: ActionType.DETONATE,
          replacements,
        },
        createdAt: serverTimestamp(),
        targetPlayerId,
        creatorId: authUserId,
        // currentState: gameState,
      },
    );
  }, [authUserId, firestore, game.id, gameState.grid, targetPlayerId]);

  const totalHits = countHits(gameState);

  return (
    <div
      onClick={highlightedCellsState.clearHighlightedCells}
      className={classNames(className, css.container)}
    >
      <GameBoard
        game={game.data()}
        gameState={gameState}
        {...{ highlightedCellsState }}
      />

      <IonButton
        color={totalHits > 0 ? "danger" : "medium"}
        disabled={totalHits === 0}
        onClick={onDetonateClick}
      >
        <IonIcon icon={flash} /> SMITE
      </IonButton>

      <ul>
        {gameState.words.reverse().map((word, i) => (
          <li key={i}>{word}</li>
        ))}
      </ul>
    </div>
  );
};

export default GameInProgress;
