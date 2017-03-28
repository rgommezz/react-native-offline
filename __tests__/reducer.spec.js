import reducer, { initialState } from '../src/reducer';
import * as actionCreators from '../src/actionCreators';

describe('reducer', () => {
  it('returns prevState if the action is not handled', () => {
    expect(reducer(initialState, { type: 'ANOTHER_ACTION_I_DONT_CARE' })).toEqual(initialState);
  });

  it('CONNECTION_CHANGE action type', () => {
    const mockAction = actionCreators.connectionChange(false);
    expect(reducer(initialState, mockAction)).toEqual({
      isConnected: false,
      actionQueue: [],
    });
  });

  /** stateAcc and actions used from now on to test different scenarios */
  let stateAcc = initialState;
  const prevActionToRetry1 = {
    type: 'FETCH_DATA_REQUEST',
    payload: {
      id: '1',
      retry: true,
    },
  };
  const prevActionToRetry2 = {
    type: 'FETCH_OTHER_REQUEST',
    payload: {
      isFetching: true,
      retry: true,
    },
  };
  const prevActionToRetry1WithDifferentPayload = {
    type: 'FETCH_DATA_REQUEST',
    payload: {
      id: '2',
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
          retry: {},
        },
      };

      const action = actionCreators.fetchOfflineMode(prevAction);
      const anotherAction = actionCreators.fetchOfflineMode(anotherPrevAction);

      expect(reducer(stateAcc, action)).toEqual(initialState);
      expect(reducer(stateAcc, anotherAction)).toEqual(initialState);
    });

    it('1st action with meta.retry === true', () => {
      const action = actionCreators.fetchOfflineMode(prevActionToRetry1);
      stateAcc = reducer(stateAcc, action);

      expect(stateAcc).toEqual({
        isConnected: stateAcc.isConnected,
        actionQueue: [prevActionToRetry1],
      });
    });

    it('a 2nd action to retry', () => {
      const action = actionCreators.fetchOfflineMode(prevActionToRetry2);
      stateAcc = reducer(stateAcc, action);

      expect(stateAcc).toEqual({
        isConnected: stateAcc.isConnected,
        actionQueue: [prevActionToRetry1, prevActionToRetry2],
      });
    });

    it('1st action to retry arrives again', () => {
      const action = actionCreators.fetchOfflineMode(prevActionToRetry1);
      stateAcc = reducer(stateAcc, action);

      expect(stateAcc).toEqual({
        isConnected: stateAcc.isConnected,
        actionQueue: [prevActionToRetry2, prevActionToRetry1],
      });
    });

    it('1st action arrives with different payload', () => {
      const action = actionCreators.fetchOfflineMode(prevActionToRetry1WithDifferentPayload);
      stateAcc = reducer(stateAcc, action);

      expect(stateAcc).toEqual({
        isConnected: stateAcc.isConnected,
        actionQueue: [prevActionToRetry2, prevActionToRetry1, prevActionToRetry1WithDifferentPayload],
      });
    });
  });

  /** stateAcc = { isConnected: true, actionQueue: [prevActionToRetry2, prevActionToRetry1, prevActionToRetry1WithDifferentPayload] */

  describe('REMOVE_ACTION_FROM_QUEUE action type', () => {
    it('removing prevActionToRetry2', () => {
      const action = actionCreators.removeActionFromQueue(prevActionToRetry2);
      stateAcc = reducer(stateAcc, action);
      expect(stateAcc).toEqual({
        isConnected: stateAcc.isConnected,
        actionQueue: [prevActionToRetry1, prevActionToRetry1WithDifferentPayload],
      });
    });

    it('removing prevActionToRetry1', () => {
      const action = actionCreators.removeActionFromQueue(prevActionToRetry1);
      stateAcc = reducer(stateAcc, action);
      expect(stateAcc).toEqual({
        isConnected: stateAcc.isConnected,
        actionQueue: [prevActionToRetry1WithDifferentPayload],
      });
    });

    it('removing prevActionToRetry1WithDifferentPayload', () => {
      const action = actionCreators.removeActionFromQueue(prevActionToRetry1WithDifferentPayload);
      stateAcc = reducer(stateAcc, action);
      expect(stateAcc).toEqual({
        isConnected: stateAcc.isConnected,
        actionQueue: [],
      });
    });
  });
});
