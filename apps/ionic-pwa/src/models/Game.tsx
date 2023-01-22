import { Timestamp } from "firebase/firestore";

export type Game = {
  targetWords: string[];
  creatorId: string;
  createdAt: Timestamp;
};
