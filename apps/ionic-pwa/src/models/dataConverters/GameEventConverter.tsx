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
  if (gameEvent.action &&
      "type" in gameEvent.action &&
      gameEvent.action.type === ActionType.INIT &&
      "grid" in gameEvent.action &&
      gameEvent.action.grid != null) {
    const grid: string[][] = gameEvent.action.grid as any;
    return {
      ...gameEvent,
      action: {
        type: gameEvent.action.type,
        grid: grid.map(row => Object.assign({}, row)),
      }
    };
  } else {
    return gameEvent;
  }
}

function firestoreDataToGame(data: StrictDocumentData): GameEvent {
  const ob: GameEvent = {
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

  if (ob.action.type === ActionType.INIT) {
    ob.action.grid = ob.action.grid.map(row =>
      Array.from({...row, length: Object.keys(row).length}))
  }

  return ob;
}

const GameEventConverter: FirestoreDataConverter<GameEvent> = {
  toFirestore: (gameEvent) => gameEventToFirestoreData(gameEvent),
  fromFirestore: (snapshot) => firestoreDataToGame(snapshot.data()),
};

export default GameEventConverter;
