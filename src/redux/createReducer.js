/* @flow */

import { get, without } from 'lodash';
import { SEMAPHORE_COLOR } from '../utils/constants';
import actionTypes from './actionTypes';
import getSimilarActionInQueue from '../utils/getSimilarActionInQueue';
import type {
  FluxAction,
  FluxActionWithPreviousIntent,
  FluxActionForRemoval,
  NetworkState,
  SemaphoreColor,
} from '../types';

export const initialState = {
  isConnected: true,
  actionQueue: [],
  isQueuePaused: false,
};

function handleOfflineAction(
  state: NetworkState,
  { payload: { prevAction, prevThunk }, meta }: FluxActionWithPreviousIntent,
  comparisonFn: Function,
): NetworkState {
  const isActionToRetry =
    typeof prevAction === 'object' && get(meta, 'retry') === true;

  const isThunkToRetry =
    typeof prevThunk === 'function' && get(prevThunk, 'meta.retry') === true;

  if (isActionToRetry || isThunkToRetry) {
    // If a similar action already existed on the queue, we remove it and push it again to the end of the queue
    const actionToLookUp = prevAction || prevThunk;
    const actionWithMetaData =
      typeof actionToLookUp === 'object'
        ? { ...actionToLookUp, meta }
        : actionToLookUp;
    const similarActionQueued = comparisonFn(
      actionWithMetaData,
      state.actionQueue,
    );

    return {
      ...state,
      actionQueue: similarActionQueued
        ? [
            ...without(state.actionQueue, similarActionQueued),
            actionWithMetaData,
          ]
        : [...state.actionQueue, actionWithMetaData],
    };
  }
  return state;
}

function handleRemoveActionFromQueue(
  state: NetworkState,
  action: FluxActionForRemoval,
): NetworkState {
  const similarActionQueued = getSimilarActionInQueue(
    action,
    state.actionQueue,
  );

  return {
    ...state,
    actionQueue: without(state.actionQueue, similarActionQueued),
  };
}

function handleDismissActionsFromQueue(
  state: NetworkState,
  triggerActionToDismiss: string,
): NetworkState {
  const newActionQueue = state.actionQueue.filter((action: FluxAction) => {
    const dismissArray = get(action, 'meta.dismiss', []);
    return !dismissArray.includes(triggerActionToDismiss);
  });

  return {
    ...state,
    actionQueue: newActionQueue,
  };
}

function handleChangeQueueSemaphore(
  state: NetworkState,
  semaphoreColor: SemaphoreColor,
): NetworkState {
  return {
    ...state,
    isQueuePaused: semaphoreColor === SEMAPHORE_COLOR.RED,
  };
}

export default (comparisonFn: Function = getSimilarActionInQueue) => (
  state: NetworkState = {
    ...initialState,
  },
  action: *,
): NetworkState => {
  switch (action.type) {
    case actionTypes.CONNECTION_CHANGE:
      return {
        ...state,
        isConnected: action.payload,
      };
    case actionTypes.FETCH_OFFLINE_MODE:
      return handleOfflineAction(state, action, comparisonFn);
    case actionTypes.REMOVE_FROM_ACTION_QUEUE:
      return handleRemoveActionFromQueue(state, action.payload);
    case actionTypes.DISMISS_ACTIONS_FROM_QUEUE:
      return handleDismissActionsFromQueue(state, action.payload);
    case actionTypes.CHANGE_QUEUE_SEMAPHORE:
      return handleChangeQueueSemaphore(state, action.payload);
    default:
      return state;
  }
};

export function networkSelector(state: { network: NetworkState }) {
  return state.network;
}
