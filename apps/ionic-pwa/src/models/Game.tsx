import { Timestamp } from "firebase/firestore";

import times from "../utilities/times";

export interface Game {
  name: string;
  createdAt: Timestamp;
  startedAt: Timestamp | null;
  boardSize: number;
  creatorId: string;
}

export enum PowerupType {
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
  currentState: GameState;
}

export interface GameState {
  grid: Cell[][];
  words: string[];
  score: number;
}

export interface RollupGameState extends GameState {
  game: Game;
  player: string;
}

function initGameState(game: Game, player: string): RollupGameState {
  return {
    game,
    player,
    grid: [],
    words: [],
    score: 0,
  };
}

const alphabet = [..."abcdefghijklmnopqrstuvwxyz"];

export function randomGrid(size: number): Cell[][] {
  const grid: Cell[][] = times(size, () => {
    return times(size, () => ({
      letter: alphabet[Math.floor(Math.random() * alphabet.length)],
      hits: 0,
      powerup: PowerupType.NONE,
    }));
  });
  return grid;
}

export function gameEventRollup(
  state: RollupGameState,
  event: GameEvent
): RollupGameState
{
  if (state.player !== event.targetPlayerId) {
    return state;
  }

  if (!state.grid || state.grid.length == 0) {
    if (event.action !== ActionType.INIT) {
      throw new Error("Uninitialized board");
    }
  }

  if (event.action === ActionType.INIT) {
    const size = state.game.boardSize;
    state.grid = randomGrid(size);
    return state;
  } else {
    throw new Error("Unknown event type");
  }
}

export function gameEventRollupAll(game: Game, player: string, events: GameEvent[]): GameState {
  return events.reduceRight(gameEventRollup, initGameState(game, player));
}
