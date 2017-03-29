import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import createNetworkMiddleware from '../src/createNetworkMiddleware';
import * as actionCreators from '../src/actionCreators';

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

  it('action ENQUEUED, status back ONLINE', () => {
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
      getFetchAction('FETCH_SOME_DATA_REQUEST'),
      actionCreators.removeActionFromQueue(action),
    ]);
  });

  it('action ENQUEUED, status back ONLINE', () => {
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
      getFetchAction('FETCH_SOME_DATA_REQUEST'),
      actionCreators.removeActionFromQueue(action),
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
});

describe('createNetworkMiddleware with thunks', () => {
  function fetchThunk(dispatch) {
    dispatch({ type: 'FETCH_DATA_REQUEST' });
  }
  function anotherThunk(dispatch) {
    dispatch({ type: 'TOGGLE_DROPDOWN' });
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

    store.dispatch(anotherThunk);

    const actions = store.getActions();
    expect(actions).toEqual([{ type: 'TOGGLE_DROPDOWN' }]);
  });

  it('thunk MATCHES criteria', () => {
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

    store.dispatch(fetchThunk);

    const actions = store.getActions();
    expect(actions).toEqual([actionCreators.fetchOfflineMode(fetchThunk)]);
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

    expect(() => store.dispatch(action)).toThrow('You should pass a regex as regexActionType param');
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

    expect(() => store.dispatch(action)).toThrow('You should pass an array as actionTypes param');
  });

  it('invalid regexFunctionName', () => {
    const initialState = {
      network: {
        isConnected: false,
        actionQueue: [],
      },
    };
    const networkMiddleware = createNetworkMiddleware({
      regexFunctionName: 'REFRESH',
    });
    const middlewares = [networkMiddleware];
    const mockStore = configureStore(middlewares);

    const store = mockStore(initialState);
    const action = getFetchAction('REFRESH_DATA');

    expect(() => store.dispatch(action)).toThrow('You should pass a regex as regexFunctionName param');
  });
});
