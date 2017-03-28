import get from 'lodash/get';
import indexOf from 'lodash/indexOf';
import without from 'lodash/without';
import { CONNECTION_CHANGE, FETCH_OFFLINE_MODE, REMOVE_FROM_ACTION_QUEUE } from './actionTypes';

const initialState = {
  isConnected: true,
  actionQueue: [],
};

function handleOfflineAction(state, action) {
  if (get(action, 'payload.meta.retry') === true) {
    // If a similar action already existed on the queue, we remove it and append it again to the end of the queue
    const index = indexOf(state.actionQueue, action);
    if (index !== 1) {
      return {
        ...state,
        actionQueue: [...without(state.actionQueue, action), action],
      };
    }
    return {
      ...state,
      actionQueue: [...state.actionQueue, action],
    };
  }
  return state;
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
      return {
        ...state,
        actionQueue: without(state.actionQueue, action),
      };
    default:
      return state;
  }
}
