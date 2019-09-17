import { find, get } from 'lodash';
import {
  fetchOfflineMode,
  removeActionFromQueue,
  dismissActionsFromQueue,
  Thunk,
  EnqueuedAction,
} from './actionCreators';
import * as networkActionTypes from './actionTypes';
import wait from '../utils/wait';
import { NetworkState, FluxAction } from '../types';
import { Middleware, MiddlewareAPI, Dispatch, AnyAction, Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

type State = {
  network: NetworkState,
};

type Arguments = {
  regexActionType: RegExp,
  actionTypes: Array<string>,
  queueReleaseThrottle: number,
};

function validateParams(regexActionType: RegExp, actionTypes: Array<string>) {
  if ({}.toString.call(regexActionType) !== '[object RegExp]')
    throw new Error('You should pass a regex as regexActionType param');

  if ({}.toString.call(actionTypes) !== '[object Array]')
    throw new Error('You should pass an array as actionTypes param');
}

function findActionToBeDismissed(action: FluxAction, actionQueue: EnqueuedAction[]) {
  return find(actionQueue, a => {
    const actionsToDismiss = get(a, 'meta.dismiss', []);
    return actionsToDismiss.includes(action.type);
  });
}

function isObjectAndShouldBeIntercepted(action: FluxAction, regexActionType: RegExp, actionTypes: Array<string>) {
  return (
    typeof action === 'object' &&
    (regexActionType.test(action.type) || actionTypes.includes(action.type))
  );
}

function isThunkAndShouldBeIntercepted(action: Thunk) {
  return typeof action === 'function' && action.interceptInOffline === true;
}

function checkIfActionShouldBeIntercepted(
  action: any,
  regexActionType: RegExp,
  actionTypes: Array<string>,
) {
  return (
    isObjectAndShouldBeIntercepted(action, regexActionType, actionTypes) ||
    isThunkAndShouldBeIntercepted(action)
  );
}

function didComeBackOnline(action: EnqueuedAction, wasConnected: boolean) {
  return (
    action.type === networkActionTypes.CONNECTION_CHANGE &&
    !wasConnected &&
    action.payload === true
  );
}

type GetState = Pick<MiddlewareAPI<Dispatch, State>, 'getState'>['getState'];
export const createReleaseQueue =
  (getState: GetState, next: ThunkDispatch<State, null, Action>, delay: number) => async (queue: EnqueuedAction[]) => {
  // eslint-disable-next-line
  for (const action of queue) {
    const { isConnected } = getState().network;
    if (isConnected) {
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
}: Arguments): Middleware {
  return ({ getState }: MiddlewareAPI) => (next: Dispatch) => (action: EnqueuedAction) => {
    const { isConnected, actionQueue } = getState().network;
    const releaseQueue = createReleaseQueue(
      getState,
      next,
      queueReleaseThrottle,
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
    if (isBackOnline) {
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
