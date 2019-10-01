import { AnyAction } from "redux";
import { EnqueuedAction } from "./redux/actionCreators";

interface MetaProps {
  retry?: boolean;
  dismiss?: string[];
}

export type Meta<T> = T & {
  meta?: MetaProps;
  interceptInOffline?: boolean;
};

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
