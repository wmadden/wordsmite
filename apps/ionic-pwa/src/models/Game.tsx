import { Timestamp } from "firebase/firestore";

export interface Game {
  name: string;
  createdAt: Timestamp;
  startedAt: Timestamp;
  boardSize: number;
  creatorId: string;
}

enum PowerupType {
  NONE = 0,
}

enum ActionType {
  MAKE_WORD  = "make_word",
  DETONATE   = "detonate",   // Remove and redraw letters that have been used in a word
  INIT       = "init",
  GAME_START = "game_start",
}

export interface Cell {
  letter: string;        // Letter contained in this cell
  hits: number;          // Number of times this cell has been used to make a word
  powerup: PowerupType;  // Powerup contained in this cell
}

export interface WordsmiteEvent {
  timestamp: Timestamp;    // When server received, server timestamp is the source of truth for event ordering
  action: ActionType;
  targetPlayerId: string;  // Player whos game state this event applies to (will be the same as creator except for powerups)
  creatorId: string;       // Who created this event
}

export interface GameState {
  grid: Cell[][];
  words: string[];
  score: number;
};
