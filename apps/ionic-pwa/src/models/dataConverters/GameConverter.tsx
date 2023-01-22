import {
  FirestoreDataConverter,
  PartialWithFieldValue,
} from "firebase/firestore";

import {
  getList,
  getString,
  isString,
  StrictDocumentData,
} from "../../utilities/firebase/firestore/dataHelpers";
import getTimestamp from "../../utilities/firebase/firestore/getTimestamp";
import { Game } from "../Game";

function gameToFirestoreData(
  game: PartialWithFieldValue<Game>,
): Record<string, unknown> {
  return game;
}

function firestoreDataToGame(data: StrictDocumentData): Game {
  return {
    targetWords: getList(data.targetWords, { element: isString }),
    creatorId: getString(data.creatorId),
    createdAt: getTimestamp(data.createdAt),
  };
}

const GameConverter: FirestoreDataConverter<Game> = {
  toFirestore: (game) => gameToFirestoreData(game),
  fromFirestore: (snapshot) => firestoreDataToGame(snapshot.data()),
};

export default GameConverter;
