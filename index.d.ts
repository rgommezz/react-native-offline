import { Middleware, Reducer, AnyAction } from "redux";

type HTTPMethod = "HEAD" | "OPTIONS";
export type NetworkState = {
  isConnected: boolean;
  actionQueue: Array<AnyAction>;
};
export type MiddlewareConfig = {
  regexActionType?: RegExp;
  actionTypes?: Array<string>;
};

export type CheckInternetConnectionConfig = {
  url?: string;
  pingTimeout?: number;
  shouldPing?: boolean;
};

type Connectivity = {
  isConnected: boolean;
}

export type NetworkProviderProps = {
  children: React.ReactNode;
  pingTimeout?: number;
  pingServerUrl?: string;
  shouldPing?: boolean;
  pingInterval?: number;
  pingOnlyIfOffline?: boolean;
  pingInBackground?: boolean;
  httpMethod?: HTTPMethod;
}

export type NetworkConsumerProps = {
  children: ({ isConnected }: Connectivity) => JSX.Element;
}

export const NetworkProvider: (props: NetworkProviderProps) => JSX.Element;
export const NetworkConsumer: (props: NetworkConsumerProps) => JSX.Element;
export const ReduxNetworkProvider: (
  props: NetworkProviderProps
) => JSX.Element;
export const reducer: Reducer<NetworkState, AnyAction>;
export const createNetworkMiddleware: (config: MiddlewareConfig) => Middleware;
export enum OfflineActionTypes {
  CONNECTION_CHANGE = "@@network-connectivity/CONNECTION_CHANGE",
  FETCH_OFFLINE_MODE = "@@network-connectivity/FETCH_OFFLINE_MODE",
  REMOVE_FROM_ACTION_QUEUE = "@@network-connectivity/REMOVE_FROM_ACTION_QUEUE",
  DISMISS_ACTIONS_FROM_QUEUE = "@@network-connectivity/DISMISS_ACTIONS_FROM_QUEUE"
}
export const checkInternetConnection: (
  config: CheckInternetConnectionConfig
) => Promise<boolean>;
export const networkSaga: (config: NetworkProviderProps) => IterableIterator<any>