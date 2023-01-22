import {
  FirestoreDataConverter,
  PartialWithFieldValue,
} from "firebase/firestore";

import {
  getString,
  getStringLiteral,
  StrictDocumentData,
} from "../../utilities/firebase/firestore/dataHelpers";
import getTimestamp from "../../utilities/firebase/firestore/getTimestamp";
import { ActionType, GameEvent, gameEventActionValues } from "../Game";

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
  };
}

const GameConverter: FirestoreDataConverter<GameEvent> = {
  toFirestore: (gameEvent) => gameEventToFirestoreData(gameEvent),
  fromFirestore: (snapshot) => firestoreDataToGame(snapshot.data()),
};

export default GameConverter;
