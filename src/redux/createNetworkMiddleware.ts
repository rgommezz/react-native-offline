import { find, get } from 'lodash';
import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import {
  fetchOfflineMode,
  removeActionFromQueue,
  dismissActionsFromQueue,
} from './actionCreators';
import * as networkActionTypes from './actionTypes';
import wait from '../utils/wait';
import { NetworkState, EnqueuedAction } from '../types';
import { SEMAPHORE_COLOR } from '../utils/constants';

type State = {
  network: NetworkState;
};
type ActionType = Array<string> | string;
type Arguments = {
  regexActionType: RegExp;
  actionTypes: ActionType;
  queueReleaseThrottle: number;
  shouldDequeueSelector: (state: State) => boolean;
};

const DEFAULT_ARGUMENTS: Arguments = {
  actionTypes: [],
  regexActionType: /FETCH.*REQUEST/,
  queueReleaseThrottle: 50,
  shouldDequeueSelector: () => true,
};

type AllActions = EnqueuedAction;

// because I don't know how many middlewares would be added, thunk, oberservable etc
type StoreDispatch = (...args: any[]) => any;

function validateParams(regexActionType: RegExp, actionTypes: ActionType) {
  if ({}.toString.call(regexActionType) !== '[object RegExp]')
    throw new Error('You should pass a regex as regexActionType param');

  if ({}.toString.call(actionTypes) !== '[object Array]')
    throw new Error('You should pass an array as actionTypes param');
}

function findActionToBeDismissed(
  action: AnyAction,
  actionQueue: EnqueuedAction[],
) {
  return find(actionQueue, a => {
    const actionsToDismiss = get(a, 'meta.dismiss', []);
    return actionsToDismiss.includes(action.type);
  });
}

function isObjectAndShouldBeIntercepted(
  action: AllActions,
  regexActionType: RegExp,
  actionTypes: ActionType,
) {
  if (typeof action === 'object' && 'type' in action) {
    return (
      regexActionType.test(action.type) || actionTypes.includes(action.type)
    );
  }
  return false;
}

function isThunkAndShouldBeIntercepted(action: AllActions) {
  return typeof action === 'function' && action.interceptInOffline === true;
}

function checkIfActionShouldBeIntercepted(
  action: AllActions,
  regexActionType: RegExp,
  actionTypes: ActionType,
): boolean {
  return (
    isObjectAndShouldBeIntercepted(action, regexActionType, actionTypes) ||
    isThunkAndShouldBeIntercepted(action)
  );
}

function didComeBackOnline(action: AllActions, wasConnected: boolean) {
  if ('type' in action && 'payload' in action) {
    return (
      action.type === networkActionTypes.CONNECTION_CHANGE &&
      !wasConnected &&
      action.payload === true
    );
  }
  return false;
}

function didQueueResume(action: AllActions, isQueuePaused: boolean) {
  if ('type' in action && 'payload' in action) {
    return (
      action.type === networkActionTypes.CHANGE_QUEUE_SEMAPHORE &&
      isQueuePaused &&
      action.payload === SEMAPHORE_COLOR.GREEN
    );
  }
  return false;
}

type GetState = Pick<MiddlewareAPI<Dispatch, State>, 'getState'>['getState'];
export const createReleaseQueue = (
  getState: GetState,
  next: StoreDispatch,
  delay: number,
  shouldDequeueSelector: Arguments['shouldDequeueSelector'],
) => async (queue: EnqueuedAction[]) => {
  // eslint-disable-next-line
  for (const action of queue) {
    const state = getState();
    const { isConnected, isQueuePaused } = state.network;
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

function createNetworkMiddleware(
  args?: Partial<Arguments>,
): Middleware<{}, State, Dispatch> {
  const {
    regexActionType,
    actionTypes,
    queueReleaseThrottle,
    shouldDequeueSelector,
  } = {
    ...DEFAULT_ARGUMENTS,
    ...args,
  };
  return ({ getState }: MiddlewareAPI<Dispatch, State>) => (
    next: StoreDispatch,
  ) => (action: AllActions) => {
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
    // narrow down type from thunk to only pass in actions with type -> AnyAction
    if ('type' in action) {
      const isAnyActionToBeDismissed = findActionToBeDismissed(
        action,
        actionQueue,
      );
      if (isAnyActionToBeDismissed && !isConnected) {
        next(dismissActionsFromQueue(action.type));
      }
    }

    // Proxy the original action to the next middleware on the chain or final dispatch
    return next(action);
  };
}

export default createNetworkMiddleware;
