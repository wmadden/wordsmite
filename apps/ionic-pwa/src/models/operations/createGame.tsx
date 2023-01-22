import {
  addDoc,
  collection,
  DocumentReference,
  Firestore,
  serverTimestamp,
} from "firebase/firestore";
import { gamesCollectionPath } from "../../firebase/firestorePathBuilders";
import GameConverter from "../dataConverters/GameConverter";
import { Game } from "../Game";

export default function createGame({
  firestore,
  game,
}: {
  firestore: Firestore;
  game: Omit<Game, "createdAt">;
}): Promise<DocumentReference<Game>> {
  const gamesCollection = collection(
    firestore,
    gamesCollectionPath(),
  ).withConverter(GameConverter);
  return addDoc<Game>(gamesCollection, {
    ...game,
    createdAt: serverTimestamp(),
  });
}
