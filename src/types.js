/* @flow */

export type FluxAction = {
  type: string,
  payload: any,
  meta?: {
    retry?: boolean,
    dismiss?: Array<string>,
  },
};

export type ReducerConfig = {
  namespace?: string,
}

export type FluxActionWithPreviousIntent = {
  type: string,
  payload: {
    prevAction?: FluxAction,
    prevThunk?: Function,
  },
  meta: {
    retry?: boolean,
    dismiss?: Array<string>,
  },
};

export type FluxActionForRemoval = {
  type: string,
  payload: FluxAction | Function,
};

export type FluxActionForDismissal = {
  type: string,
  payload: string,
};

export type NetworkState = {
  isConnected: boolean,
  actionQueue: Array<*>,
};
