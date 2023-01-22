import {
  FirestoreDataConverter,
  PartialWithFieldValue,
} from "firebase/firestore";

import {
  getValue,
  getString,
  isPermittedValue,
  isDocumentData,
  StrictDocumentData,
} from "../../utilities/firebase/firestore/dataHelpers";
import getTimestamp from "../../utilities/firebase/firestore/getTimestamp";

import {
  Action,
  ActionType,
  GameEvent,
  GameState,
  gameEventActionValues,
} from "../Game";

function isStateCheck(value: unknown): value is GameState {
  return (isDocumentData(value) &&
    Array.isArray(value.grid)  &&
    Array.isArray(value.words) &&
    typeof value.score === "number");
}

const isActionTypeValue = isPermittedValue(gameEventActionValues);

function isActionCheck(value: unknown): value is Action {
  return (isDocumentData(value) && isActionTypeValue(value.type));
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
    action: getValue(data.action, {
      typeCheck: isActionCheck,
      fallback: { type: ActionType.IGNORE }
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
