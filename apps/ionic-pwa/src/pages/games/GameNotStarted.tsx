import { IonButton } from "@ionic/react";
import {
  addDoc,
  collection,
  QueryDocumentSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import React, { useCallback } from "react";
import { useFirestore } from "reactfire";
import { gameEventsCollectionPath } from "../../firebase/firestorePathBuilders";
import GameEventConverter from "../../models/dataConverters/GameEventConverter";
import { ActionType, Game, randomGrid } from "../../models/Game";

export type GameNotStartedProps = {
  started: boolean;
  joined: boolean;
  game: QueryDocumentSnapshot<Game>;
  targetPlayerId: string;
};

const GameNotStarted: React.FC<GameNotStartedProps> = ({
  started,
  joined,
  game,
  targetPlayerId,
}) => {
  const firestore = useFirestore();

  const onGameStartClick = useCallback(async () => {
    addDoc(
      collection(
        firestore,
        gameEventsCollectionPath({ gameId: game.id }),
      ).withConverter(GameEventConverter),
      {
        action: {
          type: ActionType.GAME_START,
          startedAt: serverTimestamp(),
        },
        createdAt: serverTimestamp(),
        targetPlayerId,
        creatorId: targetPlayerId,
      },
    );
  }, [firestore, game, targetPlayerId]);

  const onJoinGameClick = useCallback(() => {
    addDoc(
      collection(
        firestore,
        gameEventsCollectionPath({ gameId: game.id }),
      ).withConverter(GameEventConverter),
      {
        action: {
          type: ActionType.INIT,
          grid: randomGrid(game.data().boardSize),
        },
        createdAt: serverTimestamp(),
        targetPlayerId,
        creatorId: targetPlayerId,
      },
    );
  }, [firestore, game, targetPlayerId]);

  if (!joined) {
    return (
      <>
        Click to join the game
        <br />
        <IonButton onClick={onJoinGameClick}>JOIN GAME</IonButton>
      </>
    );
  }
  if (!started) {
    return (
      <>
        Press this button to start the timer and begin the game for all players
        <br />
        <IonButton onClick={onGameStartClick}>START GAME</IonButton>
      </>
    );
  }
  return "?";
};

export default GameNotStarted;
