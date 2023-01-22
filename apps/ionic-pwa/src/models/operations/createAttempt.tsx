import {
  QueryDocumentSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { GameState, Attempt } from "../GameState";

export default function createAttempt({
  gameState,
  newAttempt,
}: {
  gameState: QueryDocumentSnapshot<GameState>;
  newAttempt: Attempt;
}): Promise<void> {
  return updateDoc(gameState.ref, { attempts: arrayUnion(newAttempt) });
}
