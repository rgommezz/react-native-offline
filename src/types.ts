import { Action } from "redux";

interface MetaProps {
  retry?: boolean,
  dismiss?: Array<string>,  
}

export type Meta<T> = T & {
  meta?: MetaProps
}

export interface FluxAction<T = any> extends Action {
  type: string,
  payload: T,
  meta?: MetaProps
};

export type NetworkState = {
  isConnected: boolean,
  actionQueue: Array<any>,
};

export type HTTPMethod = 'HEAD' | 'OPTIONS';
