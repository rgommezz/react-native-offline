/* @flow */

import actionTypes from './actionTypes';
import type {
  FluxAction,
  FluxActionWithPreviousIntent,
  FluxActionForRemoval,
  FluxActionForDismissal,
} from './types';
import checkInternetAccess from './checkInternetAccess';

type EnqueuedAction = FluxAction | Function;

export const connectionChange = (isConnected: boolean): FluxAction => ({
  type: actionTypes.CONNECTION_CHANGE,
  payload: isConnected,
});

export const fetchOfflineMode = (
  action: EnqueuedAction,
): FluxActionWithPreviousIntent => {
  if (typeof action === 'object') {
    return {
      type: actionTypes.FETCH_OFFLINE_MODE,
      payload: {
        prevAction: {
          type: action.type,
          payload: action.payload,
        },
      },
      meta: action.meta || {},
    };
  }
  // Thunk
  return {
    type: actionTypes.FETCH_OFFLINE_MODE,
    payload: {
      prevThunk: action,
    },
    meta: action.meta || {},
  };
};

export const removeActionFromQueue = (
  action: EnqueuedAction,
): FluxActionForRemoval => ({
  type: actionTypes.REMOVE_FROM_ACTION_QUEUE,
  payload: action,
});

export const dismissActionsFromQueue = (
  actionTrigger: string,
): FluxActionForDismissal => ({
  type: actionTypes.DISMISS_ACTIONS_FROM_QUEUE,
  payload: actionTrigger,
});

export const checkConnectivity = (
  timeout: number = 3000,
  url: string = 'https://google.com',
) => (dispatch: Function) =>
  checkInternetAccess(timeout, url)
    .then(() => dispatch(connectionChange(true)))
    .catch(() => dispatch(connectionChange(false)));
