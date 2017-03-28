import indexOf from 'lodash/indexOf';
import { fetchOfflineMode, removeActionFromQueue } from './actionCreators';

function createNetworkMiddleware({ regexActionType = /FETCH.*REQUEST/, actionTypes = [] }) {
  return ({ getState, dispatch }) => next => (action) => {
    const connectionState = getState().network.isConnected;
    const actionQueue = getState().network.actionQueue;

    if (typeof action === 'object' && (regexActionType.test(action.type) || actionTypes.includes(action.type)) && connectionState === false) {
      return next(fetchOfflineMode(action));
    } else if (typeof action === 'object' && connectionState === true && indexOf(actionQueue, action) !== -1) {
      // We are back online. The action that was queued is about to be dispatched.
      next(action); // Let it flow through the chain of middlewares and get to the reducer.
      dispatch(removeActionFromQueue(action)); // Lastly, removing the action from the queue
    }
    return next(action);
  };
}

export default createNetworkMiddleware;
