import type { OBFBoard } from "./types";
import { parseOBFBoard } from "./validation";

/** Read a File as an OBF board, rejecting if it is not valid OBF */
export async function readOBFFile(file: File): Promise<OBFBoard> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as unknown;
        const board = parseOBFBoard(parsed);
        if (!board) {
          reject(new Error("Not a valid OBF file"));
          return;
        }
        resolve(board);
      } catch {
        reject(new Error("Failed to parse OBF file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
