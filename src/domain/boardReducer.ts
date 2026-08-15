import type { Symbol } from "./vocabulary";
import type { UserBoard } from "./models";

export type BoardAction =
  | { type: "hydrateMedia"; boards: UserBoard[] }
  | { type: "createBoard"; board: UserBoard }
  | { type: "deleteBoard"; boardId: string }
  | { type: "renameBoard"; boardId: string; label: string }
  | { type: "moveBoard"; boardId: string; direction: -1 | 1 }
  | { type: "appendBoards"; boards: UserBoard[] }
  | { type: "addTile"; boardId: string; tile: Symbol }
  | { type: "deleteTile"; boardId: string; tileId: string }
  | { type: "updateTile"; boardId: string; tile: Symbol }
  | { type: "reorderTiles"; boardId: string; fromIndex: number; toIndex: number };

export function boardReducer(boards: UserBoard[], action: BoardAction): UserBoard[] {
  switch (action.type) {
    case "hydrateMedia":
      return mergeHydratedMedia(boards, action.boards);
    case "createBoard":
      return [...boards, action.board];
    case "deleteBoard":
      return boards.filter((board) => board.id !== action.boardId);
    case "renameBoard":
      return boards.map((board) =>
        board.id === action.boardId ? { ...board, label: action.label } : board,
      );
    case "moveBoard": {
      const index = boards.findIndex((board) => board.id === action.boardId);
      const target = index + action.direction;
      if (index < 0 || target < 0 || target >= boards.length) return boards;
      const reordered = [...boards];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    }
    case "appendBoards":
      return [...boards, ...action.boards];
    case "addTile":
      return updateBoard(boards, action.boardId, (board) => ({
        ...board,
        symbols: [...board.symbols, action.tile],
      }));
    case "deleteTile":
      return updateBoard(boards, action.boardId, (board) => ({
        ...board,
        symbols: board.symbols.filter((tile) => tile.id !== action.tileId),
      }));
    case "updateTile":
      return updateBoard(boards, action.boardId, (board) => ({
        ...board,
        symbols: board.symbols.map((tile) => (tile.id === action.tile.id ? action.tile : tile)),
      }));
    case "reorderTiles":
      return updateBoard(boards, action.boardId, (board) => {
        if (
          action.fromIndex < 0 ||
          action.toIndex < 0 ||
          action.fromIndex >= board.symbols.length ||
          action.toIndex >= board.symbols.length
        ) {
          return board;
        }
        const symbols = [...board.symbols];
        const [moved] = symbols.splice(action.fromIndex, 1);
        symbols.splice(action.toIndex, 0, moved);
        return { ...board, symbols };
      });
    default:
      return boards;
  }
}

function mergeHydratedMedia(currentBoards: UserBoard[], hydratedBoards: UserBoard[]): UserBoard[] {
  const hydratedById = new Map(hydratedBoards.map((board) => [board.id, board]));
  return currentBoards.map((board) => {
    const hydratedBoard = hydratedById.get(board.id);
    if (!hydratedBoard) return board;
    const hydratedTiles = new Map(hydratedBoard.symbols.map((tile) => [tile.id, tile]));
    return {
      ...board,
      symbols: board.symbols.map((tile) => {
        const hydrated = hydratedTiles.get(tile.id);
        if (!hydrated) return tile;
        return {
          ...tile,
          emoji: isMediaReference(tile.emoji) ? hydrated.emoji : tile.emoji,
          backgroundImage: isMediaReference(tile.backgroundImage)
            ? hydrated.backgroundImage
            : tile.backgroundImage,
          soundFile: isMediaReference(tile.soundFile) ? hydrated.soundFile : tile.soundFile,
        };
      }),
    };
  });
}

function isMediaReference(value: string | undefined): boolean {
  return value?.startsWith("media://") ?? false;
}

function updateBoard(
  boards: UserBoard[],
  boardId: string,
  update: (board: UserBoard) => UserBoard,
): UserBoard[] {
  return boards.map((board) => (board.id === boardId ? update(board) : board));
}
