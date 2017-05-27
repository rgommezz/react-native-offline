/* @flow */

import { find, get, isEqual } from 'lodash';
import {
  fetchOfflineMode,
  removeActionFromQueue,
  dismissActionsFromQueue
} from './actionCreators';
import type { NetworkState } from './types';

type MiddlewareAPI<S> = {
  dispatch: (action: any) => void,
  getState(): S
};

type State = {
  network: NetworkState
};

type Arguments = {|
  regexActionType: RegExp,
  actionTypes: Array<string>,
  regexFunctionName: RegExp
|};

function createNetworkMiddleware(
  {
    regexActionType = /FETCH.*REQUEST/,
    actionTypes = [],
    regexFunctionName = /fetch/
  }: Arguments = {}
) {
  return ({ getState }: MiddlewareAPI<State>) => (
    next: (action: any) => void
  ) => (action: any) => {
    if ({}.toString.call(regexActionType) !== '[object RegExp]')
      throw new Error('You should pass a regex as regexActionType param');

    if ({}.toString.call(actionTypes) !== '[object Array]')
      throw new Error('You should pass an array as actionTypes param');

    if ({}.toString.call(regexFunctionName) !== '[object RegExp]')
      throw new Error('You should pass a regex as regexFunctionName param');

    const { isConnected, actionQueue } = getState().network;

    const isObjectAndMatchCondition =
      typeof action === 'object' &&
      (regexActionType.test(action.type) || actionTypes.includes(action.type));

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
    // in ECMAScript 2015, variables and methods can infer the name of an anonymous function from its syntactic position
    const isFunctionAndMatchCondition =
      typeof action === 'function' && regexFunctionName.test(action.name);

    if (isObjectAndMatchCondition || isFunctionAndMatchCondition) {
      if (isConnected === false) {
        return next(fetchOfflineMode(action)); // Offline, preventing the original action from being dispatched. Dispatching an internal action instead.
      }
      const actionQueued = actionQueue.length > 0
        ? find(actionQueue, a => isEqual(a, action))
        : null;
      if (actionQueued) {
        // Back online and the action that was queued is about to be dispatched.
        // Removing action from queue, prior to handing over to next middleware or final dispatch
        next(removeActionFromQueue(action));

        return next(action);
      }
    }

    // We don't want to dispatch actions all the time, but rather when there is a dismissal case
    const isAnyActionToBeDismissed = find(actionQueue, a => {
      const actionsToDismiss = get(a, 'meta.dismiss', []);
      return actionsToDismiss.includes(action.type);
    });
    if (isAnyActionToBeDismissed && !isConnected) {
      next(dismissActionsFromQueue(action.type));
      return next(action);
    }

    return next(action);
  };
}

export default createNetworkMiddleware;
