import { CONNECTION_CHANGE, FETCH_OFFLINE_MODE, REMOVE_FROM_ACTION_QUEUE } from './actionTypes';

export const connectionChange = isConnected => ({
  type: CONNECTION_CHANGE,
  payload: isConnected,
});

export const fetchOfflineMode = action => ({
  type: FETCH_OFFLINE_MODE,
  payload: {
    prevAction: {
      type: action.type,
      payload: action.payload,
    },
  },
});

export const removeActionFromQueue = action => ({
  type: REMOVE_FROM_ACTION_QUEUE,
  payload: action,
});
