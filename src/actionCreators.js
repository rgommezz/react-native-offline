// @flow
import {
  CONNECTION_CHANGE,
  FETCH_OFFLINE_MODE,
  REMOVE_FROM_ACTION_QUEUE,
  DISMISS_ACTIONS_FROM_QUEUE
} from './actionTypes';
import type { FluxAction } from './types';

type EnqueuedAction = FluxAction | Function;

export const connectionChange = (isConnected: boolean): FluxAction => ({
  type: CONNECTION_CHANGE,
  payload: isConnected
});

export const fetchOfflineMode = (action: EnqueuedAction): FluxAction => {
  if (typeof action === 'object') {
    return {
      type: FETCH_OFFLINE_MODE,
      payload: {
        prevAction: {
          type: action.type,
          payload: action.payload
        }
      },
      meta: action.meta
    };
  }
  // Thunk
  return {
    type: FETCH_OFFLINE_MODE,
    payload: {
      prevThunk: action
    },
    meta: action.meta
  };
};

export const removeActionFromQueue = (action: EnqueuedAction): FluxAction => ({
  type: REMOVE_FROM_ACTION_QUEUE,
  payload: action
});

export const dismissActionsFromQueue = (actionTrigger: string): FluxAction => ({
  type: DISMISS_ACTIONS_FROM_QUEUE,
  payload: actionTrigger
});
