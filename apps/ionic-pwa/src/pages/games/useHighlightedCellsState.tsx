import { useCallback, useMemo, useState } from "react";

export type CellCoordinates = {
  row: number;
  col: number;
};

export type HighlightedCellsState = {
  highlightedCells: CellCoordinates[];
  highlightCell: (cell: CellCoordinates) => void;
  clearHighlightedCells: () => void;
};

export default function useHighlightedCellsState(): HighlightedCellsState {
  const [highlightedCells, setHighlightedCells] = useState<CellCoordinates[]>(
    [],
  );

  const highlightCell = useCallback((cellCoordinates: CellCoordinates) => {
    setHighlightedCells((currentValue) => {
      const lastHighlightedCell = currentValue[currentValue.length - 1];
      if (!lastHighlightedCell) return [...currentValue, cellCoordinates];

      const alreadyHighlighted = !!currentValue.find(
        (cell) =>
          cell.row === cellCoordinates.row && cell.col === cellCoordinates.col,
      );
      if (alreadyHighlighted) return [];

      const permitted =
        lastHighlightedCell.col - 1 <= cellCoordinates.col &&
        lastHighlightedCell.col + 1 >= cellCoordinates.col &&
        lastHighlightedCell.row - 1 <= cellCoordinates.row &&
        lastHighlightedCell.row + 1 >= cellCoordinates.row;

      if (!permitted) return currentValue;

      return [...currentValue, cellCoordinates];
    });
  }, []);

  const clearHighlightedCells = useCallback(() => {
    setHighlightedCells([]);
  }, []);

  return useMemo(
    () => ({
      highlightCell,
      highlightedCells,
      clearHighlightedCells,
    }),
    [clearHighlightedCells, highlightCell, highlightedCells],
  );
}
