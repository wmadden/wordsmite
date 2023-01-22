import {
  FirestoreDataConverter,
  PartialWithFieldValue,
} from "firebase/firestore";

import {
  getValue,
  getString,
  getStringLiteral,
  isDocumentData,
  StrictDocumentData,
} from "../../utilities/firebase/firestore/dataHelpers";
import getTimestamp from "../../utilities/firebase/firestore/getTimestamp";
import { ActionType, GameEvent, GameState, gameEventActionValues } from "../Game";

function isStateCheck(value: unknown): value is GameState {
  return (isDocumentData(value) &&
    Array.isArray(value.grid)  &&
    Array.isArray(value.words) &&
    typeof value.score === "number");
}

function gameEventToFirestoreData(
  gameEvent: PartialWithFieldValue<GameEvent>,
): Record<string, unknown> {
  return gameEvent;
}

function firestoreDataToGame(data: StrictDocumentData): GameEvent {
  return {
    creatorId: getString(data.creatorId),
    createdAt: getTimestamp(data.createdAt),
    action: getStringLiteral(data.action, {
      permitted: gameEventActionValues,
      fallback: ActionType.IGNORE,
    }),
    targetPlayerId: getString(data.targetPlayerId),
    currentState: getValue(data.currentState, {
      typeCheck: isStateCheck,
      fallback: {
        grid: [],
        words: [],
        score: 0,
      },
    }),
  };
}

const GameEventConverter: FirestoreDataConverter<GameEvent> = {
  toFirestore: (gameEvent) => gameEventToFirestoreData(gameEvent),
  fromFirestore: (snapshot) => firestoreDataToGame(snapshot.data()),
};

export default GameEventConverter;
