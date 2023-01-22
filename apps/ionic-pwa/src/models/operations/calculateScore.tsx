import { Game } from "../Game";
import { GameState } from "../GameState";

export type GameScore = {
  complete: boolean;
  userId: string;
  totalTurnsTaken: number;
};

export default function calculateScore({
  game,
  gameState,
}: {
  game: Game;
  gameState: GameState;
}): GameScore {
  const userId = gameState.creatorId;
  const targetWords = game.targetWords;
  const maxAttempts = game.targetWords.length + 5;
  const turnsTakenPerTargetWord: number[] = Array(targetWords.length);
  const maxTurnsTaken = gameState.attempts.length === maxAttempts;

  for (let i = 0; i < targetWords.length; i++) {
    const targetWord = targetWords[i];
    const correctAttemptIndex = gameState.attempts.findIndex(
      (attempt) => attempt.value === targetWord,
    );

    let turnsTakenForTargetWord: number;
    if (correctAttemptIndex !== -1) {
      turnsTakenForTargetWord = correctAttemptIndex + 1;
    } else {
      if (maxTurnsTaken) {
        turnsTakenForTargetWord = maxAttempts + 1;
      } else {
        turnsTakenForTargetWord = 0;
      }
    }

    turnsTakenPerTargetWord[i] = turnsTakenForTargetWord;
  }

  const totalTurnsTaken = turnsTakenPerTargetWord.reduce(
    (turnsTaken, result) => result + turnsTaken,
    0,
  );

  const gameIncomplete = turnsTakenPerTargetWord.includes(0);

  return {
    complete: !gameIncomplete,
    userId,
    totalTurnsTaken,
  };
}

type GameResult =
  | {
      complete: true;
      score: number;
      position: number;
      userId: string;
    }
  | {
      complete: false;
      score: number;
      position: undefined;
      userId: string;
    };

export function calculateResults({
  game,
  gameStates,
}: {
  game: Game;
  gameStates: GameState[];
}): {
  resultsByUserId: Record<string, GameResult>;
  positions: GameScore[];
} {
  const scores = gameStates.map((gameState) =>
    calculateScore({ game, gameState }),
  );
  const positions = scores.sort(
    (scoreA, scoreB) => scoreB.totalTurnsTaken - scoreA.totalTurnsTaken,
  );
  const resultsByUserId = positions.reduce<Record<string, GameResult>>(
    (result, gameScore, i) => {
      result[gameScore.userId] = gameScore.complete
        ? {
            complete: true,
            position: i + 1,
            score: gameScore.totalTurnsTaken,
            userId: gameScore.userId,
          }
        : {
            complete: false,
            position: undefined,
            score: gameScore.totalTurnsTaken,
            userId: gameScore.userId,
          };
      return result;
    },
    {},
  );
  return { positions, resultsByUserId };
}
