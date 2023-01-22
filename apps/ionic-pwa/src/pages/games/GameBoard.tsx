import { IonButton, IonCol, IonGrid, IonRow } from "@ionic/react";
import classNames from "classnames";
import { times } from "lodash";
import React from "react";
import { Game, GameState } from "../../models/Game";

import css from "./GameBoard.module.css";
import { HighlightedCellsState } from "./useHighlightedCellsState";

type GameBoardProps = {
  game: Game;
  gameState: GameState;
  highlightedCellsState: HighlightedCellsState;
};

const GameBoard: React.FC<GameBoardProps> = ({
  game,
  gameState,
  highlightedCellsState,
}) => {
  const { boardSize } = game;

  return (
    <div className={css.gameBoard}>
      <IonGrid>
        {times(boardSize, (row) => {
          return (
            <IonRow key={row}>
              {times(boardSize, (col) => {
                const cell = gameState.grid[row][col];
                return (
                  <IonCol key={col}>
                    <IonButton
                      color={
                        highlightedCellsState.highlightedCells.find(
                          (cell) => cell[0] === row && cell[1] === col,
                        )
                          ? "warning"
                          : "primary"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        highlightedCellsState.highlightCell([row, col]);
                      }}
                      className={classNames(css.letterButton, {
                        [css.detonator]: cell.hits > 0,
                      })}
                    >
                      {gameState.grid[row][col].letter}
                    </IonButton>
                  </IonCol>
                );
              })}
            </IonRow>
          );
        })}
      </IonGrid>
    </div>
  );
};

export default GameBoard;
