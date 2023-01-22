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

export interface Boom {
  pos: [number, number],
  letter: string,
}

export interface BaseAction {
  type: ActionType
}

export interface MakeWord extends BaseAction {
  type: ActionType.MAKE_WORD,
  word: string,
  letterPositions: [number, number][];
}

export interface Detonate extends BaseAction {
  type: ActionType.DETONATE,
  replacements: Boom[]
}

export interface Init extends BaseAction {
  type: ActionType.INIT,
  grid: string[][]
}

export interface Ignore extends BaseAction {
  type: ActionType.IGNORE,
}

export type Action = MakeWord | Detonate | Init | Ignore;

export interface GameEvent {
  createdAt: Timestamp;    // When server received, server timestamp is the source of truth for event ordering
  action: Action;
  targetPlayerId: string;  // Player whos game state this event applies to (will be the same as creator except for powerups)
  creatorId: string;       // Who created this event
  currentState?: GameState;
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

function randomLetter(): string {
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

const alphabet = [..."abcdefghijklmnopqrstuvwxyz"];

export function randomGrid(size: number): string[][] {
  return times(size, () =>
    times(size, () => randomLetter()));
}

export function buildCellGrid(letters: string[][]) {
  return letters.map(row => row.map(s => ({
    letter: s,
    hits: 0,
    powerup: PowerupType.NONE,
  })));
}

export function gameEventRollup(
  state: RollupGameState,
  event: GameEvent
): RollupGameState
{
  if (!("targetPlayerId" in event)) {
    throw new Error("Malformed Event");
  }

  if (state.player !== event.targetPlayerId) {
    return state;
  }

  if (!state.grid || state.grid.length == 0) {
    if (event.action.type !== ActionType.INIT) {
      throw new Error("Uninitialized board");
    }
  }

  if (event.action.type === ActionType.INIT) {
    state.grid = buildCellGrid(event.action.grid);
    return state;
  } else if (event.action.type === ActionType.MAKE_WORD) {
    state.words.push(event.action.word);
    for (const [row, col] of event.action.letterPositions) {
      state.grid[row][col].hits += 1;
    }
    state.score += 1; // FIXME
    return state;
  } else if (event.action.type === ActionType.DETONATE) {
    for (const {pos: [row, col], letter} of event.action.replacements) {
      let cell = state.grid[row][col];
      if (cell.hits == 0) {
        throw new Error("Tried to replace unused letter");
      }
      cell.hits = 0;
      cell.letter = letter;
    }
    return state;
  } else if (event.action.type === ActionType.IGNORE) {
    return state;
  } else {
    throw new Error("Unhandled event type");
  }
}

export function gameEventRollupAll(
  game: Game,
  player: string,
  events: GameEvent[]
): GameState
{
  return events.reduceRight(gameEventRollup, initGameState(game, player));
}
