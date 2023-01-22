import {
  FirestoreDataConverter,
  PartialWithFieldValue,
} from "firebase/firestore";

import {
  getNumber,
  getString,
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
    name: getString(data.name),
    boardSize: getNumber(data.boardSize),
    creatorId: getString(data.creatorId),
    createdAt: getTimestamp(data.createdAt),
  };
}

const GameConverter: FirestoreDataConverter<Game> = {
  toFirestore: (game) => gameToFirestoreData(game),
  fromFirestore: (snapshot) => firestoreDataToGame(snapshot.data()),
};

export default GameConverter;
