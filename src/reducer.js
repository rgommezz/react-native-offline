// @flow
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import find from 'lodash/find';
import without from 'lodash/without';
import {
  CONNECTION_CHANGE,
  FETCH_OFFLINE_MODE,
  REMOVE_FROM_ACTION_QUEUE,
  DISMISS_ACTIONS_FROM_QUEUE
} from './actionTypes';
import type { FluxAction, NetworkState } from './types';

export const initialState = {
  isConnected: true,
  actionQueue: []
};

function handleOfflineAction(
  state,
  { payload: { prevAction, prevThunk } = {}, meta = {} }
) {
  const isActionWithRetry =
    typeof prevAction === 'object' && get(meta, 'retry') === true;
  const isThunkWithRetry =
    typeof prevThunk === 'function' && prevThunk.retry === true;
  if (isActionWithRetry || isThunkWithRetry) {
    // If a similar action already existed on the queue, we remove it and append it again to the end of the queue
    const actionToLookUp = prevAction || prevThunk;
    const actionWithMeta = typeof actionToLookUp === 'object'
      ? { ...actionToLookUp, meta }
      : actionToLookUp;
    const similarActionQueued = find(state.actionQueue, action =>
      isEqual(action, actionWithMeta)
    );
    if (similarActionQueued) {
      return {
        ...state,
        actionQueue: [
          ...without(state.actionQueue, similarActionQueued),
          actionWithMeta
        ]
      };
    }
    return {
      ...state,
      actionQueue: [...state.actionQueue, actionWithMeta]
    };
  }
  return state;
}

function handleRemoveActionFromQueue(state, action) {
  const similarActionQueued = find(state.actionQueue, a => isEqual(action, a));
  return {
    ...state,
    actionQueue: without(state.actionQueue, similarActionQueued)
  };
}

function dismissActionsFromQueue(state, triggerActionToDismiss) {
  const newActionQueue = state.actionQueue.filter(action => {
    const dismissArray = get(action, 'meta.dismiss', []);
    return !dismissArray.includes(triggerActionToDismiss);
  });
  return {
    ...state,
    actionQueue: newActionQueue
  };
}

export default function(
  state: NetworkState = initialState,
  action: FluxAction
) {
  switch (action.type) {
    case CONNECTION_CHANGE:
      return {
        ...state,
        isConnected: action.payload
      };
    case FETCH_OFFLINE_MODE:
      return handleOfflineAction(state, action);
    case REMOVE_FROM_ACTION_QUEUE:
      return handleRemoveActionFromQueue(state, action.payload);
    case DISMISS_ACTIONS_FROM_QUEUE:
      return dismissActionsFromQueue(state, action.payload);
    default:
      return state;
  }
}
