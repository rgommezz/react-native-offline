import { Action } from "redux";

export interface FluxAction extends Action {
  type: string,
  payload: any,
  meta?: {
    retry?: boolean,
    dismiss?: Array<string>,
  },
};

export type NetworkState = {
  isConnected: boolean,
  actionQueue: Array<any>,
};

export type HTTPMethod = 'HEAD' | 'OPTIONS';
