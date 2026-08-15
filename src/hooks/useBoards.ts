import { useCallback, useEffect, useMemo, useState } from "react";
import type { Symbol } from "../data/vocabulary";
import type { UserBoard } from "../domain/models";
import { DEFAULT_WELCOME_BOARD, loadUserBoards, saveUserBoards } from "../persistence/boardStorage";

function loadInitialBoards(): UserBoard[] {
  const storedBoards = loadUserBoards();
  return storedBoards.length > 0 ? storedBoards : [DEFAULT_WELCOME_BOARD];
}

export function useBoards() {
  const [boards, setBoards] = useState<UserBoard[]>(loadInitialBoards);
  const [activeBoardId, setActiveBoardId] = useState(() => boards[0].id);

  useEffect(() => {
    if (boards.length > 0 && !boards.some((board) => board.id === activeBoardId)) {
      setActiveBoardId(boards[0].id);
    }
  }, [activeBoardId, boards]);

  useEffect(() => {
    saveUserBoards(boards);
  }, [boards]);

  const activeBoard = boards.find((board) => board.id === activeBoardId) ?? boards[0];
  const allSymbols = useMemo(() => boards.flatMap((board) => board.symbols), [boards]);

  const addTile = useCallback(
    (tile: Omit<Symbol, "id">) => {
      const newTile: Symbol = {
        ...tile,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
      setBoards((previous) =>
        previous.map((board) =>
          board.id === activeBoardId ? { ...board, symbols: [...board.symbols, newTile] } : board,
        ),
      );
    },
    [activeBoardId],
  );

  const deleteTile = useCallback(
    (symbol: Symbol) => {
      setBoards((previous) =>
        previous.map((board) =>
          board.id === activeBoardId
            ? { ...board, symbols: board.symbols.filter((tile) => tile.id !== symbol.id) }
            : board,
        ),
      );
    },
    [activeBoardId],
  );

  const reorderTiles = useCallback(
    (fromIndex: number, toIndex: number) => {
      setBoards((previous) =>
        previous.map((board) => {
          if (board.id !== activeBoardId) return board;
          const symbols = [...board.symbols];
          const [moved] = symbols.splice(fromIndex, 1);
          symbols.splice(toIndex, 0, moved);
          return { ...board, symbols };
        }),
      );
    },
    [activeBoardId],
  );

  const updateTile = useCallback(
    (symbol: Symbol, data: Omit<Symbol, "id">) => {
      setBoards((previous) =>
        previous.map((board) =>
          board.id === activeBoardId
            ? {
                ...board,
                symbols: board.symbols.map((tile) =>
                  tile.id === symbol.id ? { ...data, id: symbol.id } : tile,
                ),
              }
            : board,
        ),
      );
    },
    [activeBoardId],
  );

  return {
    boards,
    setBoards,
    activeBoard,
    activeBoardId,
    setActiveBoardId,
    allSymbols,
    addTile,
    deleteTile,
    reorderTiles,
    updateTile,
  };
}
