/* @flow */

export type State = {
  isConnected: boolean,
};

export type SemaphoreColor = 'RED' | 'GREEN';

export type FluxAction = {
  type: string,
  payload: any,
  meta?: {
    retry?: boolean,
    dismiss?: Array<string>,
  },
};

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

export type FluxActionForChangeQueueSemaphore = {
  type: string,
  payload: SemaphoreColor,
};

export type NetworkState = {
  isConnected: boolean,
  actionQueue: Array<*>,
  isQueuePaused: boolean,
};

export type HTTPMethod = 'HEAD' | 'OPTIONS';
