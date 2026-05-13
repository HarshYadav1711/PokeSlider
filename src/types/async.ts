export type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | undefined;
  error: string | undefined;
}

export function initialAsync<T>(): AsyncState<T> {
  return { status: 'idle', data: undefined, error: undefined };
}

export function loadingState<T>(): AsyncState<T> {
  return { status: 'loading', data: undefined, error: undefined };
}

export function successState<T>(data: T): AsyncState<T> {
  return { status: 'success', data, error: undefined };
}

export function emptyState<T>(): AsyncState<T> {
  return { status: 'empty', data: undefined, error: undefined };
}

export function errorState<T>(message: string): AsyncState<T> {
  return { status: 'error', data: undefined, error: message };
}
