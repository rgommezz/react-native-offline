import * as actionTypes from './actionTypes';
import { EnqueuedAction, SemaphoreColor } from '../types';

export const connectionChange = (isConnected: boolean) => ({
  type: actionTypes.CONNECTION_CHANGE as typeof actionTypes.CONNECTION_CHANGE,
  payload: isConnected,
});

export const fetchOfflineMode = (action: EnqueuedAction) => {
  const { meta = {}, ...actionRest } = action;
  if (typeof action === 'object') {
    return {
      type: actionTypes.FETCH_OFFLINE_MODE as typeof actionTypes.FETCH_OFFLINE_MODE,
      payload: {
        prevAction: {
          ...actionRest,
        },
      },
      meta,
    };
  }
  // Thunk
  return {
    type: actionTypes.FETCH_OFFLINE_MODE as typeof actionTypes.FETCH_OFFLINE_MODE,
    payload: {
      prevThunk: action,
    },
    meta,
  };
};

export const removeActionFromQueue = (action: EnqueuedAction) => ({
  type: actionTypes.REMOVE_FROM_ACTION_QUEUE as typeof actionTypes.REMOVE_FROM_ACTION_QUEUE,
  payload: action,
});

export const dismissActionsFromQueue = (actionTrigger: string) => ({
  type: actionTypes.DISMISS_ACTIONS_FROM_QUEUE as typeof actionTypes.DISMISS_ACTIONS_FROM_QUEUE,
  payload: actionTrigger,
});

export const changeQueueSemaphore = (semaphoreColor: SemaphoreColor) => ({
  type: actionTypes.CHANGE_QUEUE_SEMAPHORE,
  payload: semaphoreColor,
});

export type ConnectionChangeType = ReturnType<typeof connectionChange>;
export type FetchOfflineModeType = ReturnType<typeof fetchOfflineMode>;
export type RemoveActionFromQueueType = ReturnType<
  typeof removeActionFromQueue
>;
export type DismissActionsFromQueueType = ReturnType<
  typeof dismissActionsFromQueue
>;
export type ChangeQueueSemaphoreType = ReturnType<typeof changeQueueSemaphore>;

export type ReduxActions =
  | ConnectionChangeType
  | FetchOfflineModeType
  | RemoveActionFromQueueType
  | DismissActionsFromQueueType
  | ChangeQueueSemaphoreType;
