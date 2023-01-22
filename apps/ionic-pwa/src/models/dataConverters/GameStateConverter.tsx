import {
  FirestoreDataConverter,
  PartialWithFieldValue,
} from "firebase/firestore";

import {
  getList,
  getString,
  StrictDocumentData,
} from "../../utilities/firebase/firestore/dataHelpers";
import getTimestamp from "../../utilities/firebase/firestore/getTimestamp";
import { GameState, isAttempt } from "../GameState";

function gameStateToFirestoreData(
  gameState: PartialWithFieldValue<GameState>,
): Record<string, unknown> {
  return gameState;
}

function firestoreDataToGameState(data: StrictDocumentData): GameState {
  return {
    gameId: getString(data.gameId),
    attempts: getList(data.attempts, { element: isAttempt }),
    createdAt: getTimestamp(data.createdAt),
    creatorId: getString(data.creatorId),
  };
}

const GameStateConverter: FirestoreDataConverter<GameState> = {
  toFirestore: (gameState) => gameStateToFirestoreData(gameState),
  fromFirestore: (snapshot) => firestoreDataToGameState(snapshot.data()),
};

export default GameStateConverter;
