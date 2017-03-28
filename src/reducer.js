import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import find from 'lodash/find';
import without from 'lodash/without';
import { CONNECTION_CHANGE, FETCH_OFFLINE_MODE, REMOVE_FROM_ACTION_QUEUE } from './actionTypes';

export const initialState = {
  isConnected: true,
  actionQueue: [],
};

function handleOfflineAction(state, { payload: { prevAction } }) {
  if (get(prevAction, 'payload.retry') === true) {
    // If a similar action already existed on the queue, we remove it and append it again to the end of the queue
    const similarActionQueued = find(state.actionQueue, action => isEqual(action, prevAction));
    if (similarActionQueued) {
      return {
        ...state,
        actionQueue: [...without(state.actionQueue, similarActionQueued), prevAction],
      };
    }
    return {
      ...state,
      actionQueue: [...state.actionQueue, prevAction],
    };
  }
  return state;
}

function handleRemoveActionFromQueue(state, action) {
  const similarActionQueued = find(state.actionQueue, a => isEqual(action, a));
  return {
    ...state,
    actionQueue: without(state.actionQueue, similarActionQueued),
  };
}

export default function (state = initialState, action) {
  switch (action.type) {
    case CONNECTION_CHANGE:
      return {
        ...state,
        isConnected: action.payload,
      };
    case FETCH_OFFLINE_MODE:
      return handleOfflineAction(state, action);
    case REMOVE_FROM_ACTION_QUEUE:
      return handleRemoveActionFromQueue(state, action.payload);
    default:
      return state;
  }
}
