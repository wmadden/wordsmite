import { IonButton, IonCol, IonGrid, IonRow } from "@ionic/react";
import { times } from "lodash";
import React from "react";
import { Game, GameState } from "../models/Game";

import css from "./GameBoard.module.css";

type GameBoardProps = {
  game: Game;
  gameState: GameState;
};

const GameBoard: React.FC<GameBoardProps> = ({ game, gameState }) => {
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
                    <IonButton>{gameState.grid[row][col].letter}</IonButton>
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
