/* eslint flowtype/require-parameter-type: 0 */
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import createNetworkMiddleware from '../createNetworkMiddleware';
import * as actionCreators from '../actionCreators';

const getFetchAction = type => ({
  type,
  payload: {
    isFetching: true,
  },
});

describe('createNetworkMiddleware with actionTypes in config', () => {
  const networkMiddleware = createNetworkMiddleware({
    actionTypes: ['REFRESH_DATA'],
  });
  const middlewares = [networkMiddleware, thunk];
  const mockStore = configureStore(middlewares);

  it('action DOES NOT match criteria', () => {
    const initialState = {
      network: {
        isConnected: false,
        actionQueue: [],
      },
    };
    const store = mockStore(initialState);

    store.dispatch({ type: 'TEST' });

    const actions = store.getActions();
    expect(actions).toEqual([{ type: 'TEST' }]);
  });

  it('action MATCHES criteria, status ONLINE', () => {
    const initialState = {
      network: {
        isConnected: true,
        actionQueue: [],
      },
    };
    const store = mockStore(initialState);
    const action = getFetchAction('FETCH_SOME_DATA_REQUEST');
    store.dispatch(action);

    const actions = store.getActions();
    expect(actions).toEqual([getFetchAction('FETCH_SOME_DATA_REQUEST')]);
  });

  it('action MATCHES criteria through REGEX, status OFFLINE', () => {
    const initialState = {
      network: {
        isConnected: false,
        actionQueue: [],
      },
    };
    const store = mockStore(initialState);
    const action = getFetchAction('FETCH_SOME_DATA_REQUEST');
    store.dispatch(action);

    const actions = store.getActions();
    expect(actions).toEqual([actionCreators.fetchOfflineMode(action)]);
  });

  it('action MATCHES criteria through ARRAY of ACTION TYPES, status OFFLINE', () => {
    const initialState = {
      network: {
        isConnected: false,
        actionQueue: [],
      },
    };
    const store = mockStore(initialState);
    const action = getFetchAction('REFRESH_DATA');
    store.dispatch(action);

    const actions = store.getActions();
    expect(actions).toEqual([actionCreators.fetchOfflineMode(action)]);
  });

  it('action ENQUEUED, status back ONLINE -> action gets redispatched by HoC', () => {
    const prevActionQueue = { ...getFetchAction('FETCH_SOME_DATA_REQUEST') };
    const initialState = {
      network: {
        isConnected: true,
        actionQueue: [prevActionQueue], // different object references
      },
    };
    const store = mockStore(initialState);
    const action = getFetchAction('FETCH_SOME_DATA_REQUEST');
    store.dispatch(action);

    const actions = store.getActions();
    expect(actions).toEqual([
      actionCreators.removeActionFromQueue(action),
      getFetchAction('FETCH_SOME_DATA_REQUEST'),
    ]);
  });
});

describe('createNetworkMiddleware with NO CONFIG', () => {
  const networkMiddleware = createNetworkMiddleware();
  const middlewares = [networkMiddleware];
  const mockStore = configureStore(middlewares);

  it('REFRESH_ACTION does not match in this case in OFFLINE mode', () => {
    const initialState = {
      network: {
        isConnected: false,
        actionQueue: [],
      },
    };
    const store = mockStore(initialState);
    const action = getFetchAction('REFRESH_DATA');
    store.dispatch(action);

    const actions = store.getActions();
    expect(actions).toEqual([getFetchAction('REFRESH_DATA')]);
  });
});

describe('createNetworkMiddleware with different REGEX config', () => {
  const networkMiddleware = createNetworkMiddleware({
    regexActionType: /REFRESH/,
  });
  const middlewares = [networkMiddleware];
  const mockStore = configureStore(middlewares);

  it('REFRESH_ACTION MATCHES through REGEX in OFFLINE mode', () => {
    const initialState = {
      network: {
        isConnected: false,
        actionQueue: [],
      },
    };
    const store = mockStore(initialState);
    const action = getFetchAction('REFRESH_DATA');
    store.dispatch(action);

    const actions = store.getActions();
    expect(actions).toEqual([actionCreators.fetchOfflineMode(action)]);
  });

  it('FETCH_ACTION type no longer matches default REGEX', () => {
    const initialState = {
      network: {
        isConnected: false,
        actionQueue: [],
      },
    };
    const store = mockStore(initialState);
    const action = getFetchAction('FETCH_DATA');
    store.dispatch(action);

    const actions = store.getActions();
    expect(actions).toEqual([getFetchAction('FETCH_DATA')]);
  });
});

describe('createNetworkMiddleware with thunks', () => {
  // Helper to simulate a network request
  const fetchMockData = dispatch =>
    new Promise(resolve => {
      setTimeout(() => {
        dispatch({ type: 'FETCH_DATA_SUCCESS' });
        resolve();
      }, 1000);
    });

  function fetchData(dispatch) {
    dispatch({ type: 'FETCH_DATA_REQUEST' });
    return fetchMockData(dispatch);
  }

  fetchData.interceptInOffline = true;

  function fetchSomethingWithoutInterception(dispatch) {
    return dispatch({ type: 'TOGGLE_DROPDOWN' });
  }

  it('thunk does NOT match criteria', () => {
    const networkMiddleware = createNetworkMiddleware();
    const middlewares = [networkMiddleware, thunk];
    const mockStore = configureStore(middlewares);
    const initialState = {
      network: {
        isConnected: false,
        actionQueue: [],
      },
    };
    const store = mockStore(initialState);

    store.dispatch(fetchSomethingWithoutInterception);

    const actions = store.getActions();
    // The action went through and was dispatched
    expect(actions).toEqual([{ type: 'TOGGLE_DROPDOWN' }]);
  });

  it('thunk MATCHES criteria and we are OFFLINE', () => {
    const networkMiddleware = createNetworkMiddleware();
    const middlewares = [networkMiddleware, thunk];
    const mockStore = configureStore(middlewares);
    const initialState = {
      network: {
        isConnected: false,
        actionQueue: [],
      },
    };
    const store = mockStore(initialState);

    store.dispatch(fetchData);

    const actions = store.getActions();
    expect(actions).toEqual([actionCreators.fetchOfflineMode(fetchData)]);
  });

  it('thunk enqueued, regex MATCHES criteria, back ONLINE -> thunk gets redispatched', () => {
    const networkMiddleware = createNetworkMiddleware();
    const middlewares = [networkMiddleware, thunk];
    const mockStore = configureStore(middlewares);
    fetchData.retry = true;
    const initialState = {
      network: {
        isConnected: true,
        actionQueue: [fetchData],
      },
    };
    const store = mockStore(initialState);

    store.dispatch(fetchData).then(() => {
      const actions = store.getActions();
      expect(actions).toEqual([
        actionCreators.removeActionFromQueue(fetchData),
        { type: 'FETCH_DATA_REQUEST' },
        { type: 'FETCH_DATA_SUCCESS' },
      ]);
    });
  });
});

describe('createNetworkMiddleware with dismissing actions functionality', () => {
  describe('Plain objects', () => {
    const getFetchActionWithDismiss = (type, ...actionsToDismiss) => ({
      type,
      payload: {
        isFetching: true,
      },
      meta: {
        retry: true,
        dismiss: actionsToDismiss,
      },
    });

    it('NO actions enqueued with dismiss options', () => {
      const networkMiddleware = createNetworkMiddleware();
      const middlewares = [networkMiddleware];
      const mockStore = configureStore(middlewares);
      const actionEnqueued = getFetchActionWithDismiss('FETCH_DATA');
      const navigationAction = { type: 'NAVIGATE_BACK' };
      const initialState = {
        network: {
          isConnected: false,
          actionQueue: [actionEnqueued],
        },
      };
      const store = mockStore(initialState);
      store.dispatch(navigationAction);

      const actionsDispatched = store.getActions();
      expect(actionsDispatched).toEqual([{ type: 'NAVIGATE_BACK' }]);
    });

    it('SOME actions enqueued with dismiss options', () => {
      const networkMiddleware = createNetworkMiddleware();
      const middlewares = [networkMiddleware];
      const mockStore = configureStore(middlewares);
      const actionEnqueued = getFetchActionWithDismiss(
        'FETCH_DATA',
        'NAVIGATE_BACK',
      );
      const navigationAction = { type: 'NAVIGATE_BACK' };
      const initialState = {
        network: {
          isConnected: false,
          actionQueue: [actionEnqueued],
        },
      };
      const store = mockStore(initialState);
      store.dispatch(navigationAction);

      const actionsDispatched = store.getActions();
      expect(actionsDispatched).toEqual([
        actionCreators.dismissActionsFromQueue('NAVIGATE_BACK'),
        { type: 'NAVIGATE_BACK' },
      ]);
    });

    it('SOME actions enqueued with dismiss options, but no match', () => {
      const networkMiddleware = createNetworkMiddleware();
      const middlewares = [networkMiddleware];
      const mockStore = configureStore(middlewares);
      const actionEnqueued = getFetchActionWithDismiss(
        'FETCH_DATA',
        'NAVIGATE_BACK',
      );
      const navigationAction = { type: 'NAVIGATE_TO_LOGIN' };
      const initialState = {
        network: {
          isConnected: false,
          actionQueue: [actionEnqueued],
        },
      };
      const store = mockStore(initialState);
      store.dispatch(navigationAction);

      const actionsDispatched = store.getActions();
      expect(actionsDispatched).toEqual([{ type: 'NAVIGATE_TO_LOGIN' }]);
    });
  });
  describe('thunks', () => {
    function fetchThunk(dispatch) {
      dispatch({ type: 'FETCH_DATA_REQUEST' });
    }

    it('Thunks enqueued with NO dismiss options', () => {
      const networkMiddleware = createNetworkMiddleware();
      const middlewares = [networkMiddleware];
      const mockStore = configureStore(middlewares);
      fetchThunk.meta = {
        retry: true,
      };
      const navigationAction = { type: 'NAVIGATE_BACK' };
      const initialState = {
        network: {
          isConnected: false,
          actionQueue: [fetchThunk],
        },
      };
      const store = mockStore(initialState);
      store.dispatch(navigationAction);

      const actionsDispatched = store.getActions();
      expect(actionsDispatched).toEqual([{ type: 'NAVIGATE_BACK' }]);
    });

    it('SOME thunks enqueued with dismiss options', () => {
      const networkMiddleware = createNetworkMiddleware();
      const middlewares = [networkMiddleware];
      const mockStore = configureStore(middlewares);
      fetchThunk.meta = {
        retry: true,
        dismiss: ['NAVIGATE_TO_LOGIN'],
      };
      const navigationAction = { type: 'NAVIGATE_TO_LOGIN' };
      const initialState = {
        network: {
          isConnected: false,
          actionQueue: [fetchThunk],
        },
      };
      const store = mockStore(initialState);
      store.dispatch(navigationAction);

      const actionsDispatched = store.getActions();
      expect(actionsDispatched).toEqual([
        actionCreators.dismissActionsFromQueue('NAVIGATE_TO_LOGIN'),
        { type: 'NAVIGATE_TO_LOGIN' },
      ]);
    });
  });
});

describe('createNetworkMiddleware with wrong type params', () => {
  it('invalid regex', () => {
    const initialState = {
      network: {
        isConnected: false,
        actionQueue: [],
      },
    };
    const networkMiddleware = createNetworkMiddleware({
      regexActionType: 'REFRESH',
    });
    const middlewares = [networkMiddleware];
    const mockStore = configureStore(middlewares);

    const store = mockStore(initialState);
    const action = getFetchAction('REFRESH_DATA');

    expect(() => store.dispatch(action)).toThrow(
      'You should pass a regex as regexActionType param',
    );
  });

  it('invalid actionTypes', () => {
    const initialState = {
      network: {
        isConnected: false,
        actionQueue: [],
      },
    };
    const networkMiddleware = createNetworkMiddleware({
      actionTypes: 'REFRESH',
    });

    const middlewares = [networkMiddleware];
    const mockStore = configureStore(middlewares);

    const store = mockStore(initialState);
    const action = getFetchAction('REFRESH_DATA');

    expect(() => store.dispatch(action)).toThrow(
      'You should pass an array as actionTypes param',
    );
  });
});
