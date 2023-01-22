import { useCallback, useEffect, useMemo, useState } from "react";
import dictEn from "../../data/dict-en.csv?raw";
import { GameState } from "../../models/Game";
import useDeepEqualMemo from "../../utilities/hooks/useDeepEqualMemo";

export type CellCoordinate = [number, number];

export type HighlightedCellsState = {
  highlightedCells: CellCoordinate[];
  highlightCell: (cell: CellCoordinate) => void;
  clearHighlightedCells: () => void;
};

const dictEnSet = new Set(dictEn.split(/\s/));

export default function useHighlightedCellsState({
  onWordHighlighted,
  gameState,
}: {
  onWordHighlighted: (params: {
    word: string;
    highlightedCells: CellCoordinate[];
  }) => void;
  gameState: GameState;
}): HighlightedCellsState {
  const [highlightedCells, setHighlightedCells] = useState<CellCoordinate[]>(
    [],
  );

  const gridWithStableIdentity = useDeepEqualMemo(
    () => gameState.grid,
    [gameState.grid],
  );

  const highlightCell = useCallback(
    (cellCoordinates: CellCoordinate) => {
      setHighlightedCells((currentValue) => {
        function calculateNewValue(): CellCoordinate[] {
          const lastHighlightedCell = currentValue[currentValue.length - 1];
          if (!lastHighlightedCell) return [...currentValue, cellCoordinates];

          const alreadyHighlighted = !!currentValue.find(
            (cell) =>
              cell[0] === cellCoordinates[0] && cell[1] === cellCoordinates[1],
          );
          if (alreadyHighlighted) return [];

          const permitted =
            lastHighlightedCell[1] - 1 <= cellCoordinates[1] &&
            lastHighlightedCell[1] + 1 >= cellCoordinates[1] &&
            lastHighlightedCell[0] - 1 <= cellCoordinates[0] &&
            lastHighlightedCell[0] + 1 >= cellCoordinates[0];

          if (!permitted) return currentValue;

          return [...currentValue, cellCoordinates];
        }

        const newValue = calculateNewValue();
        const highlightedString = newValue
          .map(([row, col]) => gridWithStableIdentity[row][col].letter)
          .join("");

        if (highlightedString && dictEnSet.has(highlightedString)) {
          onWordHighlighted({
            word: highlightedString,
            highlightedCells: newValue,
          });
        }

        return newValue;
      });
    },
    [gridWithStableIdentity, onWordHighlighted],
  );

  const clearHighlightedCells = useCallback(() => {
    setHighlightedCells([]);
  }, []);

  useEffect(() => {
    setHighlightedCells([]);
  }, [gridWithStableIdentity]);

  return useMemo(
    () => ({
      highlightCell,
      highlightedCells,
      clearHighlightedCells,
    }),
    [clearHighlightedCells, highlightCell, highlightedCells],
  );
}
