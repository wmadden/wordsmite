import React from "react";
import { Game } from "../models/Game";

import css from "./GameBoard.module.css";

type GameBoardProps = {
  game: Game;
};

const GameBoard: React.FC<GameBoardProps> = ({ game }) => {
  return (
    <div className={css.gameBoard}>
      <div className={css.gameGrid}>TODO</div>
    </div>
  );
};

export default GameBoard;
