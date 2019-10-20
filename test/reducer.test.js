/* eslint flowtype/require-parameter-type: 0 */
import { isEqual } from 'lodash';
import createReducer, {
  initialState,
  networkSelector,
} from '../src/redux/createReducer';
import * as actionCreators from '../src/redux/actionCreators';
import getSimilarActionInQueue from '../src/utils/getSimilarActionInQueue';

const networkReducer = createReducer();

const getState = (isConnected = false, ...actionQueue) => ({
  isConnected,
  actionQueue,
  isQueuePaused: false,
});

/** Actions used from now on to test different scenarios */
const prevActionToRetry1 = {
  type: 'FETCH_DATA_REQUEST',
  payload: {
    id: '1',
  },
  meta: {
    retry: true,
  },
};
const prevActionToRetry2 = {
  type: 'FETCH_OTHER_REQUEST',
  payload: {
    isFetching: true,
  },
  meta: {
    retry: true,
  },
};
const prevActionToRetry1WithDifferentPayload = {
  type: 'FETCH_DATA_REQUEST',
  payload: {
    id: '2',
  },
  meta: {
    retry: true,
  },
};

describe('unknown action type', () => {
  it('returns prevState on initialization', () => {
    expect(networkReducer(undefined, { type: 'ACTION_I_DONT_CARE' })).toEqual(
      initialState,
    );
  });

  it('returns prevState if the action is not handled', () => {
    expect(
      networkReducer(initialState, { type: 'ANOTHER_ACTION_I_DONT_CARE' }),
    ).toEqual(initialState);
  });
});

describe('CONNECTION_CHANGE action type', () => {
  it('changes isConnected state properly', () => {
    const mockAction = actionCreators.connectionChange(false);
    expect(networkReducer(initialState, mockAction)).toEqual({
      isConnected: false,
      actionQueue: [],
      isQueuePaused: false,
    });
  });
});

describe('OFFLINE_ACTION action type', () => {
  describe('meta.retry !== true', () => {
    it('should NOT add the action to the queue', () => {
      const prevAction = {
        type: 'FETCH_DATA_REQUEST',
        payload: {
          id: '1',
        },
      };
      const anotherPrevAction = {
        type: 'FETCH_DATA_REQUEST',
        payload: {
          id: '1',
        },
        meta: {
          retry: false,
        },
      };

      const action = actionCreators.fetchOfflineMode(prevAction);
      const anotherAction = actionCreators.fetchOfflineMode(anotherPrevAction);

      expect(networkReducer(initialState, action)).toEqual(initialState);
      expect(networkReducer(initialState, anotherAction)).toEqual(initialState);
    });
  });

  describe('meta.retry === true', () => {
    describe('actions with DIFFERENT type', () => {
      it('actions are pushed into the queue in order of arrival', () => {
        const preAction = actionCreators.connectionChange(false);
        const action1 = actionCreators.fetchOfflineMode(prevActionToRetry1);
        const prevState = networkReducer(initialState, preAction);

        let nextState = networkReducer(prevState, action1);

        expect(nextState).toEqual({
          isConnected: false,
          actionQueue: [prevActionToRetry1],
          isQueuePaused: false,
        });

        const action2 = actionCreators.fetchOfflineMode(prevActionToRetry2);
        nextState = networkReducer(nextState, action2);

        expect(nextState).toEqual(
          getState(false, prevActionToRetry1, prevActionToRetry2),
        );
      });
    });

    describe('thunks that are the same with custom comparison function', () => {
      function comparisonFn(action, actionQueue) {
        if (typeof action === 'object') {
          return actionQueue.find(queued => isEqual(queued, action));
        }
        if (typeof action === 'function') {
          return actionQueue.find(
            queued =>
              action.meta.name === queued.meta.name &&
              action.meta.args.id === queued.meta.args.id,
          );
        }
        return undefined;
      }

      const thunkFactory = (id, name, age) => {
        function thunk(dispatch) {
          dispatch({ type: 'UPDATE_DATA_REQUEST', payload: { id, name, age } });
        }
        thunk.meta = {
          args: { id, name, age },
          retry: true,
        };
        return thunk;
      };

      it(`should add thunks if function is same but thunks are modifying different items`, () => {
        const prevState = getState(false, thunkFactory(1, 'Bilbo', 55));
        const thunk = actionCreators.fetchOfflineMode(
          thunkFactory(2, 'Link', 54),
        );

        expect(getSimilarActionInQueue(thunk, prevState.actionQueue)).toEqual(
          prevState.actionQueue[0].action,
        );

        const nextState = createReducer(comparisonFn)(prevState, thunk);

        expect(nextState.actionQueue).toHaveLength(2);
      });

      it(`should replace a thunk if thunk already exists to modify same item`, () => {
        const prevState = getState(false, thunkFactory(1, 'Bilbo', 55));
        const thunk = actionCreators.fetchOfflineMode(
          thunkFactory(1, 'Bilbo', 65),
        );

        expect(getSimilarActionInQueue(thunk, prevState.actionQueue)).toEqual(
          prevState.actionQueue[0].action,
        );

        const nextState = createReducer(comparisonFn)(prevState, thunk);

        expect(nextState.actionQueue).toHaveLength(1);
      });
    });

    describe('actions with the same type', () => {
      it(`should remove the action and add it back at the end of the queue
   if the action has the same payload`, () => {
        const prevState = getState(
          false,
          prevActionToRetry1,
          prevActionToRetry2,
        );
        const action = actionCreators.fetchOfflineMode(prevActionToRetry1);

        const nextState = networkReducer(prevState, action);
        expect(nextState).toEqual(
          getState(false, prevActionToRetry2, prevActionToRetry1),
        );
      });

      it(`should push the action if the payload is different`, () => {
        const prevState = getState(
          false,
          prevActionToRetry2,
          prevActionToRetry1,
        );
        const action = actionCreators.fetchOfflineMode(
          prevActionToRetry1WithDifferentPayload,
        );

        expect(networkReducer(prevState, action)).toEqual(
          getState(
            false,
            prevActionToRetry2,
            prevActionToRetry1,
            prevActionToRetry1WithDifferentPayload,
          ),
        );
      });
    });
  });
});

describe('REMOVE_ACTION_FROM_QUEUE action type', () => {
  it('removes the action from the queue properly', () => {
    const prevState = getState(
      false,
      prevActionToRetry2,
      prevActionToRetry1,
      prevActionToRetry1WithDifferentPayload,
    );
    // Different object references but same shape, checking that deep equal works correctly
    const action = actionCreators.removeActionFromQueue({
      ...prevActionToRetry2,
    });

    expect(networkReducer(prevState, action)).toEqual(
      getState(
        false,
        prevActionToRetry1,
        prevActionToRetry1WithDifferentPayload,
      ),
    );
  });
});

describe('QUEUE_SEMAPHORE_CHANGE action type', () => {
  it('Pauses the queue if semaphore is red', () => {
    expect(
      networkReducer(undefined, actionCreators.changeQueueSemaphore('RED')),
    ).toEqual({
      ...initialState,
      isQueuePaused: true,
    });
  });

  it('Resumes the queue if semaphore is green', () => {
    expect(
      networkReducer(undefined, actionCreators.changeQueueSemaphore('GREEN')),
    ).toEqual({
      ...initialState,
      isQueuePaused: false,
    });
  });
});

describe('thunks', () => {
  function fetchThunk(dispatch) {
    dispatch({ type: 'FETCH_DATA_REQUEST' });
  }

  describe('FETCH_OFFLINE_MODE action type', () => {
    describe('action with meta.retry !== true', () => {
      it('should NOT add the action to the queue', () => {
        const action = actionCreators.fetchOfflineMode(fetchThunk);
        expect(networkReducer(initialState, action)).toEqual(initialState);
      });
    });

    describe('action with meta.retry === true', () => {
      it('should add the action to the queue if the thunk is different', () => {
        const prevState = getState(false);
        fetchThunk.meta = {
          retry: true,
        };
        const action = actionCreators.fetchOfflineMode(fetchThunk);

        expect(networkReducer(prevState, action)).toEqual(
          getState(false, fetchThunk),
        );
      });

      it(`should remove the thunk and add it back at the end of the queue 
      if it presents the same shape`, () => {
        const thunkFactory = param => {
          function thunk1(dispatch) {
            dispatch({ type: 'FETCH_DATA_REQUEST', payload: param });
          }
          return thunk1;
        };
        const thunk = thunkFactory('foo');
        const prevState = getState(false, thunk);

        const similarThunk = thunkFactory('bar');
        similarThunk.meta = {
          retry: true,
        };
        const action = actionCreators.fetchOfflineMode(similarThunk);
        const nextState = networkReducer(prevState, action);

        expect(nextState).toEqual(getState(false, similarThunk));
      });
    });
  });

  describe('REMOVE_ACTION_FROM_QUEUE action type', () => {
    it('removes the thunk from the queue properly', () => {
      const prevState = getState(false, fetchThunk);
      const action = actionCreators.removeActionFromQueue(fetchThunk);

      expect(networkReducer(prevState, action)).toEqual(getState(false));
    });
  });
});

describe('dismiss feature', () => {
  const actionEnqueued1 = {
    type: 'FETCH_PAGE_REQUEST',
    payload: {
      id: '2',
    },
    meta: {
      retry: true,
      dismiss: ['NAVIGATE_BACK', 'NAVIGATE_TO_LOGIN'],
    },
  };
  const actionEnqueued2 = {
    type: 'FETCH_USER_REQUEST',
    payload: {
      id: '4',
    },
    meta: {
      retry: true,
      dismiss: ['NAVIGATE_TO_LOGIN'],
    },
  };
  const actionEnqueued3 = {
    type: 'FETCH_USER_REQUEST',
    payload: {
      id: '4',
    },
    meta: {
      retry: true,
    },
  };

  it('NAVIGATE_BACK dispatched, dismissing 1 action', () => {
    const prevState = getState(
      false,
      actionEnqueued1,
      actionEnqueued2,
      actionEnqueued3,
    );
    const action = actionCreators.dismissActionsFromQueue('NAVIGATE_BACK');

    expect(networkReducer(prevState, action)).toEqual(
      getState(false, actionEnqueued2, actionEnqueued3),
    );
  });

  it('NAVIGATE_TO_LOGIN dispatched, dismissing 2 actions', () => {
    const prevState = getState(
      false,
      actionEnqueued1,
      actionEnqueued2,
      actionEnqueued3,
    );
    const action = actionCreators.dismissActionsFromQueue('NAVIGATE_TO_LOGIN');

    expect(networkReducer(prevState, action)).toEqual(
      getState(false, actionEnqueued3),
    );
  });

  it("Any other action dispatched, no changes (although the middleware won't allow that)", () => {
    const prevState = getState(
      false,
      actionEnqueued1,
      actionEnqueued2,
      actionEnqueued3,
    );
    const action = actionCreators.dismissActionsFromQueue('NAVIGATE_AWAY');

    expect(networkReducer(prevState, action)).toEqual(
      getState(false, actionEnqueued1, actionEnqueued2, actionEnqueued3),
    );
  });
});

describe('networkSelector', () => {
  it('returns the correct shape', () => {
    const state = {
      network: {
        isConnected: true,
        actionQueue: ['foo'],
      },
    };
    expect(networkSelector(state)).toEqual({
      isConnected: true,
      actionQueue: ['foo'],
    });
  });
});
