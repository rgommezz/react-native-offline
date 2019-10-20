/* @flow */

import { find, get } from 'lodash';
import {
  fetchOfflineMode,
  removeActionFromQueue,
  dismissActionsFromQueue,
} from './actionCreators';
import type { NetworkState } from '../types';
import networkActionTypes from './actionTypes';
import wait from '../utils/wait';
import { SEMAPHORE_COLOR } from '../utils/constants';

type MiddlewareAPI<S> = {
  dispatch: (action: any) => void,
  getState(): S,
};

type State = {
  network: NetworkState,
};

type Arguments = {|
  regexActionType: RegExp,
  actionTypes: Array<string>,
  queueReleaseThrottle: number,
  shouldDequeueSelector: (state: State) => boolean,
|};

function validateParams(regexActionType, actionTypes) {
  if ({}.toString.call(regexActionType) !== '[object RegExp]')
    throw new Error('You should pass a regex as regexActionType param');

  if ({}.toString.call(actionTypes) !== '[object Array]')
    throw new Error('You should pass an array as actionTypes param');
}

function findActionToBeDismissed(action, actionQueue) {
  return find(actionQueue, (a: *) => {
    const actionsToDismiss = get(a, 'meta.dismiss', []);
    return actionsToDismiss.includes(action.type);
  });
}

function isObjectAndShouldBeIntercepted(action, regexActionType, actionTypes) {
  return (
    typeof action === 'object' &&
    (regexActionType.test(action.type) || actionTypes.includes(action.type))
  );
}

function isThunkAndShouldBeIntercepted(action) {
  return typeof action === 'function' && action.interceptInOffline === true;
}

function checkIfActionShouldBeIntercepted(
  action,
  regexActionType,
  actionTypes,
) {
  return (
    isObjectAndShouldBeIntercepted(action, regexActionType, actionTypes) ||
    isThunkAndShouldBeIntercepted(action)
  );
}

function didComeBackOnline(action, wasConnected) {
  return (
    action.type === networkActionTypes.CONNECTION_CHANGE &&
    !wasConnected &&
    action.payload === true
  );
}

function didQueueResume(action, isQueuePaused) {
  return (
    action.type === networkActionTypes.CHANGE_QUEUE_SEMAPHORE &&
    isQueuePaused &&
    action.payload === SEMAPHORE_COLOR.GREEN
  );
}

export const createReleaseQueue = (
  getState,
  next,
  delay,
  shouldDequeueSelector,
) => async queue => {
  // eslint-disable-next-line
  for (const action of queue) {
    const state = getState();
    const {
      network: { isConnected, isQueuePaused },
    } = state;

    if (isConnected && !isQueuePaused && shouldDequeueSelector(state)) {
      next(removeActionFromQueue(action));
      next(action);
      // eslint-disable-next-line
      await wait(delay);
    } else {
      break;
    }
  }
};

function createNetworkMiddleware({
  regexActionType = /FETCH.*REQUEST/,
  actionTypes = [],
  queueReleaseThrottle = 50,
  shouldDequeueSelector = () => true,
}: Arguments = {}) {
  return ({ getState }: MiddlewareAPI<State>) => (
    next: (action: any) => void,
  ) => (action: any) => {
    const { isConnected, actionQueue, isQueuePaused } = getState().network;
    const releaseQueue = createReleaseQueue(
      getState,
      next,
      queueReleaseThrottle,
      shouldDequeueSelector,
    );
    validateParams(regexActionType, actionTypes);

    const shouldInterceptAction = checkIfActionShouldBeIntercepted(
      action,
      regexActionType,
      actionTypes,
    );

    if (shouldInterceptAction && isConnected === false) {
      // Offline, preventing the original action from being dispatched.
      // Dispatching an internal action instead.
      return next(fetchOfflineMode(action));
    }

    const isBackOnline = didComeBackOnline(action, isConnected);
    const hasQueueBeenResumed = didQueueResume(action, isQueuePaused);

    const shouldDequeue =
      (isBackOnline || (isConnected && hasQueueBeenResumed)) &&
      shouldDequeueSelector(getState());

    if (shouldDequeue) {
      // Dispatching queued actions in order of arrival (if we have any)
      next(action);
      return releaseQueue(actionQueue);
    }

    // Checking if we have a dismissal case
    const isAnyActionToBeDismissed = findActionToBeDismissed(
      action,
      actionQueue,
    );
    if (isAnyActionToBeDismissed && !isConnected) {
      next(dismissActionsFromQueue(action.type));
    }

    // Proxy the original action to the next middleware on the chain or final dispatch
    return next(action);
  };
}

export default createNetworkMiddleware;
