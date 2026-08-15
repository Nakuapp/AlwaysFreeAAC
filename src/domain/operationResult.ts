export interface OperationSuccess<Value> {
  ok: true;
  value: Value;
  warnings: Error[];
}

export interface OperationFailure<Fallback> {
  ok: false;
  error: Error;
  fallback: Fallback;
  warnings: Error[];
}

export type OperationResult<Value, Fallback = Value> =
  OperationSuccess<Value> | OperationFailure<Fallback>;

export function operationSuccess<Value>(
  value: Value,
  warnings: Error[] = [],
): OperationSuccess<Value> {
  return { ok: true, value, warnings };
}

export function operationFailure<Fallback>(
  error: Error,
  fallback: Fallback,
  warnings: Error[] = [],
): OperationFailure<Fallback> {
  return { ok: false, error, fallback, warnings };
}
