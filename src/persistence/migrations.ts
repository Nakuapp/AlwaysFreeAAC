import {
  operationFailure,
  operationSuccess,
  type OperationResult,
} from "../domain/operationResult";

export type MigrationErrorCode =
  | "invalid-version"
  | "future-version"
  | "invalid-payload"
  | "missing-migration"
  | "migration-failed";

export class MigrationError extends Error {
  readonly code: MigrationErrorCode;

  constructor(code: MigrationErrorCode, message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "MigrationError";
    this.code = code;
  }
}

export interface MigrationRunnerOptions<Fallback> {
  input: unknown;
  currentVersion: number;
  fallback: Fallback;
  getVersion(input: unknown): unknown;
  getPayload(input: unknown): unknown;
  adaptLegacy(input: unknown): unknown;
  migrations: Readonly<Partial<Record<number, (payload: unknown) => unknown>>>;
}

export function runMigrations<Fallback>({
  input,
  currentVersion,
  fallback,
  getVersion,
  getPayload,
  adaptLegacy,
  migrations,
}: MigrationRunnerOptions<Fallback>): OperationResult<unknown, Fallback> {
  let versionValue: unknown;
  try {
    versionValue = getVersion(input);
  } catch (error) {
    return operationFailure(
      new MigrationError("invalid-payload", "Could not read the persisted payload version.", error),
      fallback,
    );
  }

  let version: number;
  let payload: unknown;
  if (versionValue === undefined) {
    version = 0;
    try {
      payload = adaptLegacy(input);
    } catch (error) {
      return operationFailure(
        new MigrationError("invalid-payload", "The legacy persisted payload is invalid.", error),
        fallback,
      );
    }
  } else {
    if (!Number.isInteger(versionValue) || (versionValue as number) < 1) {
      return operationFailure(
        new MigrationError("invalid-version", "The persisted payload version is invalid."),
        fallback,
      );
    }
    version = versionValue as number;
    if (version > currentVersion) {
      return operationFailure(
        new MigrationError(
          "future-version",
          `Persisted payload version ${version} is newer than supported version ${currentVersion}.`,
        ),
        fallback,
      );
    }
    try {
      payload = getPayload(input);
    } catch (error) {
      return operationFailure(
        new MigrationError("invalid-payload", "The persisted payload is invalid.", error),
        fallback,
      );
    }
  }

  while (version < currentVersion) {
    const migrate = migrations[version];
    if (!migrate) {
      return operationFailure(
        new MigrationError(
          "missing-migration",
          `No migration is registered from version ${version} to ${version + 1}.`,
        ),
        fallback,
      );
    }
    try {
      payload = migrate(payload);
    } catch (error) {
      return operationFailure(
        new MigrationError(
          "migration-failed",
          `Migration from version ${version} to ${version + 1} failed.`,
          error,
        ),
        fallback,
      );
    }
    version += 1;
  }

  return operationSuccess(payload);
}
