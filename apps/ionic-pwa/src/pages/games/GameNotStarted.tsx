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
    await addDoc(
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

  return !started ? (
    <IonButton onClick={onGameStartClick}>START GAME</IonButton>
  ) : !joined ? (
    <IonButton onClick={onJoinGameClick}>JOIN GAME</IonButton>
  ) : null;
};

export default GameNotStarted;
