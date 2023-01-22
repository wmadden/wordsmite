import { describe, it, expect } from 'vitest';

import { Timestamp } from "firebase/firestore";
import { Game, GameEvent, Action, ActionType, Init, gameEventRollupAll, randomGrid } from "./Game";


const player1 = "test_player1_id_abc123";
const player2 = "test_player2_id_xyz789";

function testGame(): Game {
  return {
    name: "Test Game",
    createdAt: Timestamp.now(),
    boardSize: 4,
    creatorId: player1,
  };
}

function makeEvent(action: Action): GameEvent {
  return {
    createdAt: Timestamp.now(),
    action: action,
    targetPlayerId: player1,
    creatorId: player1,
  };
}

function testInitEvent(): GameEvent {
  return makeEvent({
    type: ActionType.INIT,
    grid: randomGrid(4),
  });
}

describe("Game", () => {
  it("handle events", () => {
    const game = testGame();
    const player = player1;
    const events: GameEvent[] = [
      testInitEvent(),
    ];
    const state = gameEventRollupAll(game, player, events);
  });
});
