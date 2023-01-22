import { collection, QueryDocumentSnapshot } from "firebase/firestore";
import React, { useMemo } from "react";
import { useFirestore, useFirestoreCollection } from "reactfire";
import { gameEventsCollectionPath } from "../../firebase/firestorePathBuilders";
import GameEventConverter from "../../models/dataConverters/GameEventConverter";
import {
  Cell,
  Game,
  GameEvent,
  GameState,
  PowerupType,
} from "../../models/Game";
import times from "../../utilities/times";
import GameBoard from "./GameBoard";

export type GameInProgressProps = {
  game: QueryDocumentSnapshot<Game>;
  authUserId: string;
  targetPlayerId: string;
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
    player: "",
  };
}

const GameInProgress: React.FC<GameInProgressProps> = ({ game }) => {
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

  return <GameBoard game={game.data()} gameState={gameState} />;
};

export default GameInProgress;
