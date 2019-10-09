import { AnyAction } from "redux";

export interface Thunk {
  (...args: any[]): any;
  meta?: MetaProps;
  interceptInOffline?: boolean;
}
export type EnqueuedAction = FluxAction | Thunk;

interface MetaProps {
  retry?: boolean;
  dismiss?: string[];
}

export interface FluxAction<T = any> extends AnyAction {
  type: string;
  payload: T;
  meta?: MetaProps;
}

export type NetworkState = {
  isConnected: boolean;
  actionQueue: EnqueuedAction[];
};

export type HTTPMethod = "HEAD" | "OPTIONS";

export type AddUndefined<T> = { [P in keyof T]: T[P] | undefined };

export type ConnectivityArgs = {
  pingTimeout: number;
  pingServerUrl: string;
  shouldPing: boolean;
  pingInterval: number;
  pingOnlyIfOffline: boolean;
  pingInBackground: boolean;
  httpMethod: HTTPMethod;
};

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

// https://stackoverflow.com/a/58110124/2615091
export function nonNullable<T>(value: T): value is NonNullable<T> {
  return !!value;
}
