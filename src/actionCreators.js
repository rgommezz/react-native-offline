import get from 'lodash/get';
import { CONNECTION_CHANGE, FETCH_OFFLINE_MODE, REMOVE_FROM_ACTION_QUEUE } from './actionTypes';

export const connectionChange = isConnected => ({
  type: CONNECTION_CHANGE,
  payload: isConnected,
});

export const fetchOfflineMode = prevAction => ({
  type: FETCH_OFFLINE_MODE,
  payload: {
    prevActionType: prevAction.type,
    prevActionPayload: prevAction.payload,
    retry: get(prevAction, 'payload.meta.retry'),
  },
});

export const removeActionFromQueue = action => ({
  type: REMOVE_FROM_ACTION_QUEUE,
  payload: action,
});
