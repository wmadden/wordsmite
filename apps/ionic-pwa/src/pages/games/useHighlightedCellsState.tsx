import { useCallback, useMemo, useState } from "react";
import dictEn from "../../data/dict-en.csv?raw";
import { CellCoordinate, GameState } from "../../models/Game";
import useDeepEqualMemo from "../../utilities/hooks/useDeepEqualMemo";

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
              cell.row === cellCoordinates.row &&
              cell.col === cellCoordinates.col,
          );
          if (alreadyHighlighted) return [];

          const permitted =
            lastHighlightedCell.col - 1 <= cellCoordinates.col &&
            lastHighlightedCell.col + 1 >= cellCoordinates.col &&
            lastHighlightedCell.row - 1 <= cellCoordinates.row &&
            lastHighlightedCell.row + 1 >= cellCoordinates.row;

          if (!permitted) return currentValue;

          return [...currentValue, cellCoordinates];
        }

        const newValue = calculateNewValue();
        const highlightedString = newValue
          .map(({ row, col }) => gridWithStableIdentity[row][col].letter)
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

  // useEffect(() => {
  //   setHighlightedCells([]);
  // }, [gridWithStableIdentity]);

  return useMemo(
    () => ({
      highlightCell,
      highlightedCells,
      clearHighlightedCells,
    }),
    [clearHighlightedCells, highlightCell, highlightedCells],
  );
}
