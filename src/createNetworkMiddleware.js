import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import { fetchOfflineMode, removeActionFromQueue } from './actionCreators';

function createNetworkMiddleware({ regexActionType = /FETCH.*REQUEST/, actionTypes = [], regexFunctionName = /fetch/ } = {}) {
  return ({ getState }) => next => (action) => {
    if ({}.toString.call(regexActionType) !== '[object RegExp]') throw new Error('You should pass a regex as regexActionType param');

    if ({}.toString.call(actionTypes) !== '[object Array]') throw new Error('You should pass an array as actionTypes param');

    if ({}.toString.call(regexFunctionName) !== '[object RegExp]') throw new Error('You should pass a regex as regexFunctionName param');

    const isObjectAndMatchCondition = typeof action === 'object' && (regexActionType.test(action.type) || actionTypes.includes(action.type));

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
    // in ECMAScript 2015, variables and methods can infer the name of an anonymous function from its syntactic position
    const isFunctionAndMatchCondition = typeof action === 'function' && regexFunctionName.test(action.name) && !connectionState;

    const connectionState = getState().network.isConnected;
    const actionQueue = getState().network.actionQueue;

    if (isObjectAndMatchCondition || isFunctionAndMatchCondition) {
      if (connectionState === false) {
        return next(fetchOfflineMode(action));
      }
      const actionQueued = actionQueue.length > 0 ? find(actionQueue, a => isEqual(a, action)) : null;
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
