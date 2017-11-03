/* @flow */

import { get, isEqual, find, without } from 'lodash';
import actionTypes from './actionTypes';
import type {
  FluxAction,
  FluxActionWithPreviousIntent,
  FluxActionForRemoval,
  NetworkState,
  ReducerConfig,
} from './types';

export const initialState = {
  isConnected: true,
  actionQueue: [],
};

function handleOfflineAction(
  state: NetworkState,
  {
    payload: { prevAction, prevThunk } = {},
    meta,
  }: FluxActionWithPreviousIntent,
  config: ReducerConfig,
): NetworkState {
  const isActionToRetry =
    typeof prevAction === 'object' && get(meta, `${config.namespace || ''}.dismiss`) === true;

  const isThunkToRetry =
    typeof prevThunk === 'function' && get(prevThunk, `meta${config.namespace || ''}.retry`) === true;

  if (isActionToRetry || isThunkToRetry) {
    // If a similar action already existed on the queue, we remove it and push it again to the end of the queue
    const actionToLookUp = prevAction || prevThunk;
    const actionWithMetaData = typeof actionToLookUp === 'object'
      ? { ...actionToLookUp, meta }
      : actionToLookUp;
    const similarActionQueued = find(state.actionQueue, (action: *) =>
      isEqual(action, actionWithMetaData),
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
  const similarActionQueued = find(state.actionQueue, (a: *) =>
    isEqual(action, a),
  );

  return {
    ...state,
    actionQueue: without(state.actionQueue, similarActionQueued),
  };
}

function handleDismissActionsFromQueue(
  state: NetworkState,
  triggerActionToDismiss: string,
  config: ReducerConfig,
): NetworkState {
  const newActionQueue = state.actionQueue.filter((action: FluxAction) => {
    const dismissArray = get(action, `meta${config.namespace || ''}.dismiss`, []);
    return !dismissArray.includes(triggerActionToDismiss);
  });

  return {
    ...state,
    actionQueue: newActionQueue,
  };
}

function maker(config: ReducerConfig = {}) {
  return function (
    state: NetworkState = initialState,
    action: *,
  ): NetworkState {
    switch (action.type) {
      case actionTypes.CONNECTION_CHANGE:
        return {
          ...state,
          isConnected: action.payload,
        };
      case actionTypes.FETCH_OFFLINE_MODE:
        return handleOfflineAction(state, action, config);
      case actionTypes.REMOVE_FROM_ACTION_QUEUE:
        return handleRemoveActionFromQueue(state, action.payload);
      case actionTypes.DISMISS_ACTIONS_FROM_QUEUE:
        return handleDismissActionsFromQueue(state, action.payload, config);
      default:
        return state;
    }
  }
}
export default maker();
