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
