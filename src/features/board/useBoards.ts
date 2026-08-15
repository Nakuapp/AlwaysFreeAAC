import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { boardReducer, type Symbol, type UserBoard } from "../../domain";
import {
  DEFAULT_WELCOME_BOARD,
  loadUserBoards,
  saveUserBoards,
} from "../../persistence/boardStorage";
import { hydrateBoardMedia } from "../../persistence/mediaStorage";
import { browserStorage, type KeyValueStorage } from "../../persistence/storage";
import { createId } from "../../utils/createId";

export function useBoards(
  onError?: (error: Error) => void,
  storage: KeyValueStorage = browserStorage,
) {
  const [initialLoad] = useState(() => loadUserBoards(storage));
  const loadedBoards = initialLoad.ok ? initialLoad.value : initialLoad.fallback;
  const [boards, dispatch] = useReducer(
    boardReducer,
    loadedBoards.length > 0 ? loadedBoards : [DEFAULT_WELCOME_BOARD],
  );
  const [activeBoardId, setActiveBoardId] = useState(() => boards[0].id);
  const [isHydrated, setIsHydrated] = useState(false);
  const initialBoardsRef = useRef(boards);
  const initialLoadReportedRef = useRef(false);
  const onErrorRef = useRef(onError);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  onErrorRef.current = onError;

  useEffect(() => {
    if (initialLoadReportedRef.current || !onError) return;
    initialLoadReportedRef.current = true;
    if (!initialLoad.ok) onError(initialLoad.error);
    initialLoad.warnings.forEach(onError);
  }, [initialLoad, onError]);

  useEffect(() => {
    let cancelled = false;
    setIsHydrated(false);

    void (async () => {
      const result = await hydrateBoardMedia(initialBoardsRef.current);
      if (cancelled) return;
      if (!result.ok) onErrorRef.current?.(result.error);
      result.warnings.forEach((warning) => onErrorRef.current?.(warning));
      dispatch({
        type: "hydrateMedia",
        boards: result.ok ? result.value : result.fallback,
      });
      setIsHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (boards.length > 0 && !boards.some((board) => board.id === activeBoardId)) {
      setActiveBoardId(boards[0].id);
    }
  }, [activeBoardId, boards]);

  useEffect(() => {
    if (!isHydrated) return;
    const snapshot = boards;
    saveQueueRef.current = saveQueueRef.current
      .then(async () => {
        const result = await saveUserBoards(snapshot, storage);
        if (!result.ok) onError?.(result.error);
        result.warnings.forEach((warning) => onError?.(warning));
      })
      .catch((error) => {
        onError?.(error instanceof Error ? error : new Error("Board persistence failed."));
      });
  }, [boards, isHydrated, onError, storage]);

  const activeBoard = boards.find((board) => board.id === activeBoardId) ?? boards[0];
  const allSymbols = useMemo(() => boards.flatMap((board) => board.symbols), [boards]);

  const addTile = useCallback(
    (tile: Omit<Symbol, "id">) => {
      dispatch({
        type: "addTile",
        boardId: activeBoardId,
        tile: { ...tile, id: createId("custom") },
      });
    },
    [activeBoardId],
  );

  const deleteTile = useCallback(
    (symbol: Symbol) => {
      dispatch({ type: "deleteTile", boardId: activeBoardId, tileId: symbol.id });
    },
    [activeBoardId],
  );

  const reorderTiles = useCallback(
    (fromIndex: number, toIndex: number) => {
      dispatch({ type: "reorderTiles", boardId: activeBoardId, fromIndex, toIndex });
    },
    [activeBoardId],
  );

  const updateTile = useCallback(
    (symbol: Symbol, data: Omit<Symbol, "id">) => {
      dispatch({ type: "updateTile", boardId: activeBoardId, tile: { ...data, id: symbol.id } });
    },
    [activeBoardId],
  );

  const createBoard = useCallback((label: string, emoji: string) => {
    dispatch({
      type: "createBoard",
      board: { id: createId("board"), label: label.trim(), emoji, symbols: [] },
    });
  }, []);

  const deleteBoard = useCallback((boardId: string) => {
    dispatch({ type: "deleteBoard", boardId });
  }, []);

  const renameBoard = useCallback((boardId: string, label: string) => {
    dispatch({ type: "renameBoard", boardId, label: label.trim() });
  }, []);

  const moveBoard = useCallback((boardId: string, direction: -1 | 1) => {
    dispatch({ type: "moveBoard", boardId, direction });
  }, []);

  const importBoards = useCallback((importedBoards: UserBoard[]) => {
    dispatch({ type: "appendBoards", boards: importedBoards });
  }, []);

  return {
    boards,
    activeBoard,
    activeBoardId,
    setActiveBoardId,
    allSymbols,
    addTile,
    deleteTile,
    reorderTiles,
    updateTile,
    createBoard,
    deleteBoard,
    renameBoard,
    moveBoard,
    importBoards,
  };
}
