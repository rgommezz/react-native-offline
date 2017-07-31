/* eslint flowtype/require-parameter-type: 0 */
import reducer, { initialState } from '../reducer';
import * as actionCreators from '../actionCreators';

describe('reducer', () => {
  const getState = (isConnected = false, ...actionQueue) => ({
    isConnected,
    actionQueue,
  });

  it('returns prevState on initialization', () => {
    expect(reducer(undefined, { type: 'ACTION_I_DONT_CARE' })).toEqual(
      initialState,
    );
  });

  it('returns prevState if the action is not handled', () => {
    expect(
      reducer(initialState, { type: 'ANOTHER_ACTION_I_DONT_CARE' }),
    ).toEqual(initialState);
  });

  it('CONNECTION_CHANGE action type', () => {
    const mockAction = actionCreators.connectionChange(false);
    expect(reducer(initialState, mockAction)).toEqual({
      isConnected: false,
      actionQueue: [],
    });
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
  /** */

  describe('OFFLINE_ACTION action type', () => {
    it('action with NO meta.retry === true', () => {
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

      expect(reducer(initialState, action)).toEqual(initialState);
      expect(reducer(initialState, anotherAction)).toEqual(initialState);
    });

    it('1st action with meta.retry === true', () => {
      const action1 = actionCreators.connectionChange(false);
      const action2 = actionCreators.fetchOfflineMode(prevActionToRetry1);
      const prevState = reducer(initialState, action1);

      expect(reducer(prevState, action2)).toEqual({
        isConnected: false,
        actionQueue: [prevActionToRetry1],
      });
    });

    it('a 2nd action to retry', () => {
      const prevState = getState(false, prevActionToRetry1);
      const action = actionCreators.fetchOfflineMode(prevActionToRetry2);

      expect(reducer(prevState, action)).toEqual(
        getState(false, prevActionToRetry1, prevActionToRetry2),
      );
    });

    it('1st action to retry arrives again', () => {
      const prevState = getState(false, prevActionToRetry1, prevActionToRetry2);
      const action = actionCreators.fetchOfflineMode(prevActionToRetry1);

      expect(reducer(prevState, action)).toEqual(
        getState(false, prevActionToRetry2, prevActionToRetry1),
      );
    });

    it('1st action arrives with different payload', () => {
      const prevState = getState(false, prevActionToRetry2, prevActionToRetry1);
      const action = actionCreators.fetchOfflineMode(
        prevActionToRetry1WithDifferentPayload,
      );

      expect(reducer(prevState, action)).toEqual(
        getState(
          false,
          prevActionToRetry2,
          prevActionToRetry1,
          prevActionToRetry1WithDifferentPayload,
        ),
      );
    });
  });

  describe('REMOVE_ACTION_FROM_QUEUE action type', () => {
    it('removing prevActionToRetry2, action queue reduces length by 1', () => {
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

      expect(reducer(prevState, action)).toEqual(
        getState(
          false,
          prevActionToRetry1,
          prevActionToRetry1WithDifferentPayload,
        ),
      );
    });

    it('removing prevActionToRetry1, action queue empty', () => {
      const prevState = getState(false, prevActionToRetry1);
      const action = actionCreators.removeActionFromQueue(prevActionToRetry1);

      expect(reducer(prevState, action)).toEqual(getState(false));
    });
  });

  describe('dealing with thunks', () => {
    function fetchThunk(dispatch) {
      dispatch({ type: 'FETCH_DATA_REQUEST' });
    }

    it('OFFLINE_ACTION action type, thunk with NO meta.retry === true', () => {
      const action = actionCreators.fetchOfflineMode(fetchThunk);
      expect(reducer(initialState, action)).toEqual(initialState);
    });

    it('OFFLINE_ACTION action type, thunk with meta.retry === true', () => {
      const prevState = getState(false);
      fetchThunk.meta = {
        retry: true,
      };
      const action = actionCreators.fetchOfflineMode(fetchThunk);

      expect(reducer(prevState, action)).toEqual(getState(false, fetchThunk));
    });

    it('REMOVE_ACTION_FROM_QUEUE removing fetchThunk', () => {
      const prevState = getState(false, fetchThunk);
      const action = actionCreators.removeActionFromQueue(fetchThunk);

      expect(reducer(prevState, action)).toEqual(getState(false));
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

      expect(reducer(prevState, action)).toEqual(
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
      const action = actionCreators.dismissActionsFromQueue(
        'NAVIGATE_TO_LOGIN',
      );

      expect(reducer(prevState, action)).toEqual(
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

      expect(reducer(prevState, action)).toEqual(
        getState(false, actionEnqueued1, actionEnqueued2, actionEnqueued3),
      );
    });
  });
});
