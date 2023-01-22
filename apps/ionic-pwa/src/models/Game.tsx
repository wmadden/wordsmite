import { Timestamp } from "firebase/firestore";

export interface Game {
  name: string;
  createdAt: Timestamp;
  startedAt: Timestamp | null;
  boardSize: number;
  creatorId: string;
}

enum PowerupType {
  NONE = 0,
}

export enum ActionType {
  MAKE_WORD  = "make_word",
  DETONATE   = "detonate",   // Remove and redraw letters that have been used in a word
  INIT       = "init",
  GAME_START = "game_start",
  IGNORE     = "ignore" // Ignore this event
}
export const gameEventActionValues: readonly ActionType[] = Object.freeze([
  ActionType.DETONATE,
  ActionType.GAME_START,
  ActionType.INIT,
  ActionType.MAKE_WORD,
  ActionType.IGNORE
])

export interface Cell {
  letter: string;        // Letter contained in this cell
  hits: number;          // Number of times this cell has been used to make a word
  powerup: PowerupType;  // Powerup contained in this cell
}

export interface GameEvent {
  createdAt: Timestamp;    // When server received, server timestamp is the source of truth for event ordering
  action: ActionType;
  targetPlayerId: string;  // Player whos game state this event applies to (will be the same as creator except for powerups)
  creatorId: string;       // Who created this event
}

export interface GameState {
  grid: Cell[][];
  words: string[];
  score: number;
  player: string;
}

function initGameState(player: string): GameState {
  return {
    grid: [],
    words: [],
    score: 0,
    player,
  };
}

export function gameEventRollup(state: GameState, event: GameEvent): GameState {
  if (state.player !== event.targetPlayerId) {
    // TODO print warning
  }

  if (state.grid.length == 0) {
    if (event.action !== ActionType.INIT) {
      throw new Error("Action ");
    }
  }

  return state;
}

export function gameEventRollupAll(player: string, events: GameEvent[]): GameState {
  return events.reduceRight(gameEventRollup, initGameState(player));
}
