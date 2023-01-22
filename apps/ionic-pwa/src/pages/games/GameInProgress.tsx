import { IonButton, useIonToast } from "@ionic/react";
import classNames from "classnames";
import {
  addDoc,
  collection,
  QueryDocumentSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import React, { useCallback, useMemo } from "react";
import { useFirestore, useFirestoreCollection } from "reactfire";
import { gameEventsCollectionPath } from "../../firebase/firestorePathBuilders";
import GameEventConverter from "../../models/dataConverters/GameEventConverter";
import {
  ActionType,
  Boom,
  Cell,
  Game,
  GameEvent,
  GameState,
  PowerupType,
} from "../../models/Game";
import times from "../../utilities/times";
import GameBoard from "./GameBoard";
import css from "./GameInProgress.module.css";
import useHighlightedCellsState, {
  CellCoordinate,
} from "./useHighlightedCellsState";

export type GameInProgressProps = {
  game: QueryDocumentSnapshot<Game>;
  authUserId: string;
  targetPlayerId: string;
  className?: string;
};

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

function calculateGameState({
  game,
  gameEvents,
}: {
  game: QueryDocumentSnapshot<Game>;
  gameEvents: QueryDocumentSnapshot<GameEvent>[];
}): GameState {
  // TODO: calculate me
  const gameData = game.data();
  const grid: Cell[][] = times(gameData.boardSize, () => {
    return times(gameData.boardSize, () => ({
      letter: alphabet[Math.floor(Math.random() * alphabet.length)],
      hits: 0,
      powerup: PowerupType.NONE,
    }));
  });
  return {
    grid,
    words: [],
    score: 0,
  };
}

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
}) => {
  const firestore = useFirestore();
  const gameEventsCollection = useFirestoreCollection(
    collection(
      firestore,
      gameEventsCollectionPath({ gameId: game.id }),
    ).withConverter(GameEventConverter),
  );

  const gameState = useMemo(() => {
    return (
      game &&
      calculateGameState({
        game,
        gameEvents: gameEventsCollection.data?.docs || [],
      })
    );
  }, [game, gameEventsCollection.data]);

  const [presentToast] = useIonToast();
  const onWordHighlighted = useCallback(
    ({
      word,
      highlightedCells,
    }: {
      word: string;
      highlightedCells: CellCoordinate[];
    }): void => {
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
          currentState: gameState,
        },
      );

      presentToast({
        message: `Found a word: ${word}!`,
        color: "success",
        duration: 1500,
      });
    },
    [authUserId, firestore, game.id, gameState, presentToast, targetPlayerId],
  );

  const highlightedCellsState = useHighlightedCellsState({
    gameState,
    onWordHighlighted,
  });

  const onDetonateClick = useCallback(() => {
    const replacements: Boom[] = highlightedCellsState.highlightedCells.map(
      (cellCoordinate) => ({
        pos: cellCoordinate,
        letter: alphabet[Math.floor(Math.random() * alphabet.length)],
      }),
    );

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
        currentState: gameState,
      },
    );
  }, [
    authUserId,
    firestore,
    game.id,
    gameState,
    highlightedCellsState.highlightedCells,
    targetPlayerId,
  ]);

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
        DETONATE
      </IonButton>
    </div>
  );
};

export default GameInProgress;
