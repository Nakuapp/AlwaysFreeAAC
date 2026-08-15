import type { Symbol } from "../domain";
import type { UserBoard } from "../domain/models";
import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "../domain/operationResult";

const DATABASE_NAME = "always-free-aac";
const DATABASE_VERSION = 1;
const MEDIA_STORE_NAME = "tile-media";
const MEDIA_REFERENCE_PREFIX = "media://";

type MediaField = "emoji" | "backgroundImage" | "soundFile";

let databasePromise: Promise<IDBDatabase> | undefined;

function mediaStorageError(message: string, cause?: unknown): Error {
  return new Error(message, cause === undefined ? undefined : { cause });
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(mediaStorageError("IndexedDB is unavailable."));
  }
  if (databasePromise) return databasePromise;

  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        database.createObjectStore(MEDIA_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(mediaStorageError("Could not open media storage.", request.error));
    request.onblocked = () => reject(mediaStorageError("Media storage upgrade was blocked."));
  }).catch((error) => {
    databasePromise = undefined;
    throw error;
  });
  databasePromise = opening;
  return opening;
}

function requestResult<T>(request: IDBRequest<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(mediaStorageError(message, request.error));
  });
}

function transactionComplete(transaction: IDBTransaction, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(mediaStorageError(message, transaction.error));
    transaction.onabort = () => reject(mediaStorageError(message, transaction.error));
  });
}

function mediaKey(tileId: string, field: MediaField): string {
  return `${tileId}:${field}`;
}

function mediaReference(key: string): string {
  return `${MEDIA_REFERENCE_PREFIX}${encodeURIComponent(key)}`;
}

function referenceKey(value: string): string | undefined {
  if (!value.startsWith(MEDIA_REFERENCE_PREFIX)) return undefined;
  try {
    return decodeURIComponent(value.slice(MEDIA_REFERENCE_PREFIX.length));
  } catch (error) {
    throw mediaStorageError(`Invalid media reference: ${value}`, error);
  }
}

function isDataUrlForField(field: MediaField, value: string): boolean {
  if (field === "soundFile") return value.startsWith("data:audio/");
  return value.startsWith("data:image/");
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  try {
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.blob();
  } catch (error) {
    throw mediaStorageError("Could not convert tile media data to a Blob.", error);
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(mediaStorageError("Media Blob did not produce a data URL."));
    reader.onerror = () =>
      reject(mediaStorageError("Could not read stored tile media.", reader.error));
    reader.readAsDataURL(blob);
  });
}

async function putBlob(key: string, blob: Blob): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(MEDIA_STORE_NAME, "readwrite");
  const completion = transactionComplete(transaction, `Could not store media item ${key}.`);
  transaction.objectStore(MEDIA_STORE_NAME).put(blob, key);
  await completion;
}

async function getBlob(key: string): Promise<Blob> {
  const database = await openDatabase();
  const transaction = database.transaction(MEDIA_STORE_NAME, "readonly");
  const result = await requestResult(
    transaction.objectStore(MEDIA_STORE_NAME).get(key),
    `Could not read media item ${key}.`,
  );
  if (!(result instanceof Blob)) throw mediaStorageError(`Stored media item ${key} was not found.`);
  return result;
}

async function serializeField(
  tile: Symbol,
  field: MediaField,
  value: string | undefined,
  errors: Error[],
): Promise<string | undefined> {
  if (!value || !isDataUrlForField(field, value)) return value;
  const key = mediaKey(tile.id, field);
  try {
    await putBlob(key, await dataUrlToBlob(value));
    return mediaReference(key);
  } catch (error) {
    errors.push(mediaStorageError(`Tile ${tile.id} ${field} was kept as a data URL.`, error));
    return value;
  }
}

async function hydrateField(
  value: string | undefined,
  errors: Error[],
): Promise<string | undefined> {
  if (!value) return value;
  let key: string | undefined;
  try {
    key = referenceKey(value);
  } catch (error) {
    errors.push(
      error instanceof Error ? error : mediaStorageError("Invalid media reference.", error),
    );
    return value;
  }
  if (!key) return value;
  try {
    return await blobToDataUrl(await getBlob(key));
  } catch (error) {
    errors.push(mediaStorageError(`Media reference ${value} could not be hydrated.`, error));
    return value;
  }
}

export async function serializeBoardMedia(
  boards: UserBoard[],
): Promise<OperationResult<UserBoard[]>> {
  const warnings: Error[] = [];
  try {
    const serializedBoards = await Promise.all(
      boards.map(async (board) => ({
        ...board,
        symbols: await Promise.all(
          board.symbols.map(async (tile) => ({
            ...tile,
            emoji: (await serializeField(tile, "emoji", tile.emoji, warnings)) ?? tile.emoji,
            backgroundImage: await serializeField(
              tile,
              "backgroundImage",
              tile.backgroundImage,
              warnings,
            ),
            soundFile: await serializeField(tile, "soundFile", tile.soundFile, warnings),
          })),
        ),
      })),
    );
    return operationSuccess(serializedBoards, warnings);
  } catch (error) {
    return operationFailure(
      mediaStorageError("Could not serialize board media.", error),
      boards,
      warnings,
    );
  }
}

export async function hydrateBoardMedia(
  boards: UserBoard[],
): Promise<OperationResult<UserBoard[]>> {
  const warnings: Error[] = [];
  try {
    const hydratedBoards = await Promise.all(
      boards.map(async (board) => ({
        ...board,
        symbols: await Promise.all(
          board.symbols.map(async (tile) => ({
            ...tile,
            emoji: (await hydrateField(tile.emoji, warnings)) ?? tile.emoji,
            backgroundImage: await hydrateField(tile.backgroundImage, warnings),
            soundFile: await hydrateField(tile.soundFile, warnings),
          })),
        ),
      })),
    );
    return operationSuccess(hydratedBoards, warnings);
  } catch (error) {
    return operationFailure(
      mediaStorageError("Could not hydrate board media.", error),
      boards,
      warnings,
    );
  }
}

export async function cleanupUnreferencedMedia(boards: UserBoard[]): Promise<void> {
  const referencedKeys = new Set<string>();
  for (const board of boards) {
    for (const tile of board.symbols) {
      for (const value of [tile.emoji, tile.backgroundImage, tile.soundFile]) {
        if (!value) continue;
        const key = referenceKey(value);
        if (key) referencedKeys.add(key);
      }
    }
  }

  const database = await openDatabase();
  const transaction = database.transaction(MEDIA_STORE_NAME, "readwrite");
  const completion = transactionComplete(transaction, "Could not clean up unreferenced media.");
  const store = transaction.objectStore(MEDIA_STORE_NAME);
  const keys = await requestResult(store.getAllKeys(), "Could not list stored media.");
  for (const key of keys) {
    if (typeof key !== "string" || !referencedKeys.has(key)) store.delete(key);
  }
  await completion;
}
