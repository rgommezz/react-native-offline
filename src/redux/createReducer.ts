import { get, without } from 'lodash';
import { AnyAction } from 'redux';
import * as actionTypes from './actionTypes';
import getSimilarActionInQueue from '../utils/getSimilarActionInQueue';
import {
  NetworkState,
  nonNullable,
  EnqueuedAction,
  FluxAction,
  Thunk,
} from '../types';
import { ActionCreatorTypes, FetchOfflineModeType } from './actionCreators';

const actionQueue: EnqueuedAction[] = [];
export const initialState = {
  isConnected: true,
  actionQueue,
};

function handleOfflineAction(
  state: NetworkState,
  { payload: { prevAction, prevThunk }, meta }: FetchOfflineModeType,
  comparisonFn: ComparisonFn,
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
        ? ({ ...actionToLookUp, meta } as FluxAction)
        : actionToLookUp;
    const similarActionQueued = comparisonFn(
      actionWithMetaData,
      state.actionQueue,
    );
    const actions = similarActionQueued
      ? [...without(state.actionQueue, similarActionQueued), actionWithMetaData]
      : [...state.actionQueue, actionWithMetaData];
    return {
      ...state,
      actionQueue: actions.filter(nonNullable),
    };
  }
  return state;
}

function handleRemoveActionFromQueue(
  state: NetworkState,
  action: EnqueuedAction,
): NetworkState {
  const similarActionQueued = getSimilarActionInQueue(
    action,
    state.actionQueue,
  );

  return {
    ...state,
    actionQueue: without(state.actionQueue, similarActionQueued).filter(
      nonNullable,
    ),
  };
}

function handleDismissActionsFromQueue(
  state: NetworkState,
  triggerActionToDismiss: string,
): NetworkState {
  const newActionQueue = state.actionQueue.filter(action => {
    const dismissArray = get(action, 'meta.dismiss', []);
    return !dismissArray.includes(triggerActionToDismiss);
  });

  return {
    ...state,
    actionQueue: newActionQueue,
  };
}

type ComparisonFn = (
  action: any,
  actionQueue: EnqueuedAction[],
) => FluxAction<any> | Thunk | undefined;
export default (comparisonFn: ComparisonFn = getSimilarActionInQueue) => (
  state: NetworkState = initialState,
  action: ActionCreatorTypes | AnyAction,
): NetworkState => {
  switch (action.type) {
    case actionTypes.CONNECTION_CHANGE:
      return {
        ...state,
        isConnected: action.payload,
      };
    case actionTypes.FETCH_OFFLINE_MODE:
      return handleOfflineAction(
        state,
        action as FetchOfflineModeType,
        comparisonFn,
      );

    case actionTypes.REMOVE_FROM_ACTION_QUEUE:
      return handleRemoveActionFromQueue(state, action.payload);
    case actionTypes.DISMISS_ACTIONS_FROM_QUEUE:
      return handleDismissActionsFromQueue(state, action.payload);
    default:
      return state;
  }
};

export function networkSelector(state: { network: NetworkState }) {
  return state.network;
}
