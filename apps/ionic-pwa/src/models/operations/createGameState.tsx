import { doc, Firestore, serverTimestamp, setDoc } from "firebase/firestore";
import { gameStatesDocPath } from "../../firebase/firestorePathBuilders";
import GameStateConverter from "../dataConverters/GameStateConverter";

export default async function createGameState({
  firestore,
  gameId,
  userId,
}: {
  firestore: Firestore;
  gameId: string;
  userId: string;
}) {
  const gameStateRef = doc(
    firestore,
    gameStatesDocPath({ gameId, userId }),
  ).withConverter(GameStateConverter);
  await setDoc(gameStateRef, {
    gameId: gameId,
    attempts: [],
    creatorId: userId,
    createdAt: serverTimestamp(),
  });
}
