import { Timestamp } from "firebase/firestore";
import { isString } from "lodash";
import { isTimestamp } from "../utilities/firebase/client/isTimestamp";
import { isDocumentData } from "../utilities/firebase/firestore/dataHelpers";

export type Attempt = {
  value: string;
  createdAt: Timestamp;
};

export function isAttempt(value: unknown): value is Attempt {
  return (
    isDocumentData(value) &&
    isString(value.value) &&
    isTimestamp(value.createdAt)
  );
}

export type GameState = {
  gameId: string;
  attempts: Attempt[];
  createdAt: Timestamp;
  creatorId: string;
};
