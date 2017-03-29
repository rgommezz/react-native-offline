import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import { fetchOfflineMode, removeActionFromQueue } from './actionCreators';

function createNetworkMiddleware({ regexActionType = /FETCH.*REQUEST/, actionTypes = [] } = {}) {
  return ({ getState }) => next => (action) => {
    if ({}.toString.call(regexActionType) !== '[object RegExp]') throw new Error('You should pass a regex as regexActionType param');

    if ({}.toString.call(actionTypes) !== '[object Array]') throw new Error('You should pass an array as actionTypes param');

    const connectionState = getState().network.isConnected;
    const actionQueue = getState().network.actionQueue;

    if (typeof action === 'object' && (regexActionType.test(action.type) || actionTypes.includes(action.type))) {
      if (connectionState === false) {
        return next(fetchOfflineMode(action));
      }
      const actionQueued = find(actionQueue, a => isEqual(a, action));
      if (actionQueued) {
        // Back online and the action that was queued is about to be dispatched.
        next(action); // Let it flow through the chain of middlewares and get to the reducer, so that it can start the re-fetching process.
        return next(removeActionFromQueue(action)); // Removing action from queue
      }
    }

    return next(action);
  };
}

export default createNetworkMiddleware;
