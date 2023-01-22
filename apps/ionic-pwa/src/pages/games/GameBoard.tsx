import { IonButton, IonCol, IonGrid, IonRow } from "@ionic/react";
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
                return (
                  <IonCol key={col}>
                    <IonButton
                      color={
                        highlightedCellsState.highlightedCells.find(
                          (cell) => cell.row === row && cell.col === col,
                        )
                          ? "warning"
                          : "primary"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        highlightedCellsState.highlightCell({ row, col });
                      }}
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
