# react-native-offline
[![CircleCI](https://circleci.com/gh/rgommezz/react-native-offline.svg?style=shield)](https://circleci.com/gh/rgommezz/react-native-offline) [![npm version](https://badge.fury.io/js/react-native-offline.svg)](https://badge.fury.io/js/react-native-offline) [![Coverage Status](https://coveralls.io/repos/github/rauliyohmc/react-native-offline/badge.svg?branch=master)](https://coveralls.io/github/rauliyohmc/react-native-offline?branch=master)
[![npm](https://img.shields.io/npm/dm/react-native-offline.svg)]()

Handful of utilities you should keep in your toolbelt to handle offline/online connectivity in React Native. It supports iOS, Android and Windows platforms. You can leverage all the functionalities provided or just the ones that suits your needs, the modules are conveniently decoupled.

Check out [this medium article](https://blog.callstack.io/your-react-native-offline-tool-belt-795abd5f0183) to see the power of the library with real world examples! 🚀

## Contents

* [Motivation](#motivation)
* [Features](#features)
* [Contributions](#contributions)
* [Installation](#installation)
* [API](#api)
  * [Component Utilities](#component-utilities)
    + [`withNetworkConnectivity()`](#withnetworkconnectivity)
    + [`ConnectivityRenderer`](#connectivityrenderer)
  * [Integration with Redux](#integration-with-redux)
    + [`Network reducer`](#network-reducer)
    + [`createNetworkMiddleware()`](#createnetworkmiddleware)
    + [`Offline Queue`](#offline-queue)
  * [Other Utilities](#other-utilities)
    + [`checkInternetConnection`](#checkinternetconnection)
* [Miscellanea](#miscellanea)
  * [FAQ](#faq)
  * [Inspiration](#inspiration)
  * [License](#license)

## Motivation
When you are building your React Native app, you have to expect that some users may use your application in offline mode, for instance when travelling on a Plane (airplane mode) or the underground (no signal). How does your app behave in that situation? Does it show an infinite loader? Can the user still use it seamlessly?

Having an offline first class citizen app is very important for a successful user experience. React Native ships with the `NetInfo` module in order to detect internet connectivity. The API is pretty basic and it may be sufficient for small apps but its usage gets cumbersome as your app grows. Besides that, it only detects network connectivity and does not guarantee internet access so it can provide false positives.

This library aims to gather a variety of modules that follow React and Redux best practises, in order to make your life easier when it comes to deal with internet connectivity in your React Native application.

## Features
- Offline/online conditional rendering through HOC or Render Callback techniques
- Reducer to keep your connectivity state in the Redux store
- **Redux middleware to intercept internet request actions in offline mode and apply DRY principle**
- Compatibility with async middleware libraries like redux-thunk, redux-saga and redux-observable
- A saga to place the network event subscriptions outside of your components
- **A step further than `NetInfo` detecting internet access besides network connectivity**
- Offline queue support to automatically re-dispatch actions when connection is back online or **dismiss actions based on other actions dispatched (i.e navigation related)**
- Ability to check connectivity regularly

## Contributions
PRs are more than welcome. If you're planning to contribute please make sure to read the contributing guide: [CONTRIBUTING.md](https://github.com/rgommezz/react-native-offline/blob/master/CONTRIBUTING.md)

## Installation
This library supports React Native v0.48 or higher.
```
$ yarn add react-native-offline
```

#### Android
This library uses the `NetInfo` module from React Native underneath the hood. To request network info in Android an extra step is required, so you should add the following line to your app's `AndroidManifest.xml` as well:

`<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`

## API

### Component Utilities
In order to render stuff conditionally with ease. They internally listen to connection changes and also provide an extra layer of reliability by ensuring there is internet access when reporting online. For that, a HEAD request is made to a remote server.

#### `withNetworkConnectivity()`
Higher order function that returns a higher order component (HOC).

```js
withNetworkConnectivity(config: Config): (WrappedComponent) => EnhancedComponent

type Config = {
  withRedux?: boolean = false,
  timeout?: number = 3000,
  pingServerUrl?: string = 'https://www.google.com/',
  withExtraHeadRequest?: boolean = true,
  checkConnectionInterval?: number = 0,
  checkIntervalOfflineOnly?: boolean = false,
  checkInBackground?: boolean = false,
  httpMethod?: string = 'HEAD',
}
```

##### Config
`withRedux`: flag that indicates whether the HoC should be wired up to the Redux store. By default, this parameter is `false` and the HoC injects `isConnected` as a prop into `WrappedComponent`. If `true` provided, it won't act as a component utility and pass any prop down, but instead perform the needed actions to sync up with the store. See below [Redux integration](#integration-with-redux) for more details.

`timeout`: amount of time (in ms) that the component should wait for the ping response. Defaults to 3s.

`pingServerUrl`: remote server to ping to. It defaults to https://www.google.com/ since it's probably one the most stable servers out there, but you can provide your own if needed.

`withExtraHeadRequest`: flag that denotes whether the extra ping check will be performed or not. Defaults to `true`.

`checkConnectionInterval`: the interval (in ms) you want to ping the server at. The default is 0, and that means it is not going to regularly check connectivity.

`checkIntervalOfflineOnly`: boolean who trigger the interval function only if there is no connection when set to `true`. Defaults to `false`.

`checkInBackground`: whether or not to check connectivity when app isn't active. Default is `false`.

`httpMethod`: usage http method to check the internet-access. Supports HEAD or OPTIONS. Default is `HEAD`.

##### Usage
```js
import React from 'react';
import { Text } from 'react-native';
import { withNetworkConnectivity } from 'react-native-offline';

const YourComponent = ({ isConnected }) => (
  <Text>{isConnected ? 'Look ma, I am connected to the internet!' : 'Offline :('}</Text>
);

export default withNetworkConnectivity()(YourComponent);
```

#### `ConnectivityRenderer`
React component that accepts a function as children. It allows you to decouple your parent component and your child component, managing connectivity state on behalf of the components it is composed with, without making demands on how that state is leveraged by its children. Useful for conditionally render different children based on connectivity status. `timeout`, `pingServerUrl` and `withExtraHeadRequest` can be provided through props in this case.

##### Props
```js
type Props = {
  children: (isConnected: boolean) => React$Element<any>
  timeout?: number = 3000,
  pingServerUrl?: string = 'https://www.google.com/',
  withExtraHeadRequest?: boolean = true,
}
```

##### Usage
```js
...
import { ConnectivityRenderer } from 'react-native-offline';

const YourComponent = () => (
  <View>
    <Text>Image Screen</Text>
    <ConnectivityRenderer>
      {isConnected => (
        isConnected ? (
          <Button title="Download image" />
        ) : (
          <Text>Downloading images is disabled since you are offline</Text>
        )
      )}
    </ConnectivityRenderer>
    <View>
      <Text>Another Section</Text>
    </View>
    <ConnectivityRenderer>
      {isConnected => (
        <SnackBar
          message="You are currently offline"
          showIf={!isConnected}
          duration={3000}
        />
      )}
    </ConnectivityRenderer>
  </View>
);

```

Note: since this component will re-render its children every time its parent's props or state changes, it's recommended to use it on leaf components in your tree.

## Integration with Redux
There are 3 features that this library provides in order to leverage offline capabilities in your Redux store: a reducer, a middleware and an offline queue system. You can use all of them or just the ones that suits your needs.

### Network reducer
A network reducer to be provided to the store.

#### State
```js
type NetworkState = {
  isConnected: boolean,
  actionQueue: Array<*>
}
```

#### Usage

##### 1.- Give the network reducer to Redux
```js
// configureStore.js
import { createStore, combineReducers } from 'redux'
import { reducer as network } from 'react-native-offline';

const rootReducer = combineReducers({
  // ... your other reducers here ...
  network,
});

const store = createStore(rootReducer);
export default store;
```

##### 2.- Here you have 2 options:

##### 2a.- Wrap your top most React component into `withNetworkConnectivity` and configure it with `withRedux = true`.
The other [config](#config) parameters, `timeout` and `pingServerUrl` can be provided to the store as well. Make sure your component is a descendant of the react-redux `<Provider>` component, so that `withNetworkConnectivity` has access to the store.

```js
// Root.js
import store from './configureStore';
import React from 'react';
import { Provider } from 'react-redux';
import { withNetworkConnectivity } from 'react-native-offline';

let App = () => (
  <Navigator>
    <MainScreen />
    <OtherScreen />
  </Navigator>
);

App = withNetworkConnectivity({
  withRedux: true // It won't inject isConnected as a prop in this case
})(App);

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider
);
```

##### 2b.- Fork `networkEventsListenerSaga` from your root saga.
If you are using redux-saga, I highly encourage you this option since it's a very elegant way to deal with global connectivity changes, without having to wrap your components with extra functionality. It receives the same [config](#config) options as `withNetworkConnectivity` HOC, with the exception of `withRedux`, which is not needed in this case.

```js
// rootSaga.js
import { all } from 'redux-saga/effects';
import saga1 from './saga1';
import saga2 from './saga2';
import { networkEventsListenerSaga } from 'react-native-offline';

export default function* rootSaga(): Generator<*, *, *> {
  yield all([
    fork(saga1),
    fork(saga2),
    fork(networkEventsListenerSaga, { timeout: 2000, checkConnectionInterval: 20000 }),
  ]);
}
```

##### 3.- Access your network state in your components using `mapStateToProps()`, as `state.network.isConnected`.

**Note**: If you wanna listen to the action dispatched internally in your reducers, import the offline action types and reference `CONNECTION_CHANGE`:
```js
import { offlineActionTypes } from 'react-native-offline';
...
if(action.type === offlineActionTypes.CONNECTION_CHANGE) // do something in your reducer
...
```

#### `createNetworkMiddleware()`
Function that returns a Redux middleware which listens to specific actions targetting API calls in online/offline mode.

```js
createNetworkMiddleware(config: Config): ReduxMiddleware

type Config = {
  regexActionType?: RegExp = /FETCH.*REQUEST/,
  actionTypes?: Array<string> = []
}
```

##### PO Config
This is the setup you need to put in place for libraries such as `redux-saga` or `redux-observable`, which rely on plain actions being dispatched to trigger async flow:

`regexActionType`: regular expression to indicate the action types to be intercepted in offline mode.
By default it's configured to intercept actions for fetching data following the Redux [convention](https://redux.js.org/docs/advanced/AsyncActions.html). That means that it will intercept actions with types such as `FETCH_USER_ID_REQUEST`, `FETCH_PRODUCTS_REQUEST` etc.

`actionTypes`: array with additional action types to intercept that don't fulfil the RegExp criteria. For instance, it's useful for actions that carry along refreshing data, such as `REFRESH_LIST`.

##### Thunks Config
For `redux-thunk` library, the async flow is wrapped inside functions that will be lazily evaluated when dispatched, so our store is able to dispatch functions as well. Therefore, the configuration differs:

- Make sure to use a named function instead of an anonymous arrow function for the thunk returned by your action creator.
- Use `interceptInOffline` property in your thunk and set it to `true`.

Example:

```javascript
export const fetchUser = (url) => {
  function thunk(dispatch) {
    fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        dispatch({type: FETCH_USER_SUCCESS, payload: responseJson});
      })
      .catch((error) => {
        console.error(error);
      });
  };

  thunk.interceptInOffline = true; // This is the important part
  return thunk; // Return it afterwards
};
```

##### Usage
You should apply the middleware to the store using `applyMiddleware`. **The network middleware should be the first on the chain**, before any other middleware used for handling async actions, such as [redux-thunk](https://github.com/gaearon/redux-thunk), [redux-saga](https://github.com/redux-saga/redux-saga) or [redux-observable](https://github.com/redux-observable/redux-observable).

```js
import { createStore, applyMiddleware } from 'redux';
import { createNetworkMiddleware } from 'react-native-offline';
import createSagaMiddleware from 'redux-saga';

const sagaMiddleware = createSagaMiddleware();
const networkMiddleware = createNetworkMiddleware();

const store = createStore(
  rootReducer,
  applyMiddleware(networkMiddleware, sagaMiddleware)
);
```

When you attempt to fetch data on the internet by means of dispatching a plain action or a thunk in offline mode, the middleware blocks the action and dispatches an action of type `@@network-connectivity/FETCH_OFFLINE_MODE` instead, containing useful information about "what you attempted to do". The action dispatched signature for plain objects is as follows:

```js
type FetchOfflineModeActionForPO = {
  type: '@@network-connectivity/FETCH_OFFLINE_MODE',
  payload: {
    prevAction: {
      type: string, // Your previous action type
      payload?: any, // Your previous payload
    }
  }
}
```

And for thunks it attaches it under `prevThunk` property:

```js
type FetchOfflineModeActionForThunks = {
  type: '@@network-connectivity/FETCH_OFFLINE_MODE',
  payload: {
    prevThunk: Function
  }
}
```

That allows you to react conveniently and update your state in the way you desire, based on your previous intent. Just reference `FETCH_OFFLINE_MODE` action type in your reducer:
```js
import { offlineActionTypes } from 'react-native-offline';
...
if(action.type === offlineActionTypes.FETCH_OFFLINE_MODE) // do something in your reducer
...
```
SnackBars, Dialog, Popups, or simple informative text are good means of conveying to the user that the operation failed due to lack of internet connection.

### Offline Queue
A queue system to store actions that failed due to lack of connectivity. It works for both plain object actions and thunks.
It allows you to:
- Re-dispatch the action/thunk as soon as the internet connection is back online again
- Dismiss the action from the queue based on a different action dispatched (i.e. navigating to a different screen, the fetch action is no longer relevant)

#### Plain Objects
In order to configure your PO actions to interact with the offline queue you need to use the `meta` property in your actions, following [flux standard actions convention](https://github.com/acdlite/flux-standard-action#meta). They need to adhere to the below API:

```js
type ActionToBeQueued = {
  type: string,
  payload?: any,
  meta: {
    retry?: boolean, // By passing true, your action will be enqueued on offline mode
    dismiss?: Array<string> // Array of actions which, once dispatched, will trigger a dismissal from the queue
  }
}
```

##### Examples
- Action that will be added to the queue on offline mode and that will be re-dispatched as soon as the connection is back online again

```js
const action = {
  type: 'FETCH_USER_ID',
  payload: {
    id: 2
  },
  meta: {
    retry: true
  }
};
```

- Action that will be added to the queue on offline mode and that will be re-dispatched as soon as the connection is back online again, as long as a `NAVIGATE_BACK` action type hasn't been dispatched in between, in which case the action would be removed from the queue.

```js
const action = {
  type: 'FETCH_USER_ID',
  payload: {
    id: 2
  },
  meta: {
    retry: true,
    dismiss: ['NAVIGATE_BACK']
  }
};
```

#### Thunks
- For thunks, append `interceptInOffline` and `meta` properties to the function returned by the action creator, where `meta` has the same shape as for Flux actions:

```js
function fetchData(dispatch, getState) {
  dispatch({ type: FETCH_USER_ID_REQUEST, payload: { id: '3' } });
  ...
}

fetchData.interceptInOffline = true; // In order to be intercepted by the middleware
fetchData.meta = {
  retry?: boolean, // By passing true, your thunk will be enqueued on offline mode
  dismiss?: Array<string> // Array of actions which, once dispatched, will trigger a dismissal from the queue
}
```

### Other utilities

#### `checkInternetConnection()`
Utility function that allows you to query for internet connectivity on demand. If you have integrated this library with redux, you can then dispatch a `CONNECTION_CHANGE` action type to inform the `network` reducer accordingly and keep it up to date. Check the example below.

```js
checkInternetConnection(timeout?: number = 3000, url?: string = 'https://www.google.com/'): Promise<boolean>
```

##### Example

```js
import { checkInternetConnection, offlineActionTypes } from 'react-native-offline';

async function internetChecker(dispatch) {
  const isConnected = await checkInternetConnection();
  // Dispatching can be done inside a connected component, a thunk (where dispatch is injected), saga, or any sort of middleware
  // In this example we are using a thunk
  dispatch({
    type: offlineActionTypes.CONNECTION_CHANGE,
    payload: isConnected,
  });
}
```

## Miscellanea

### FAQ

#### How to test offline behavior while actually being online
You can use `pingServerUrl` and set it to a non existing url or point to some server that is down.

#### How to orchestrate Redux to dispatch `CONNECTION_CHANGE` as the first action when the app starts up
The solution involves using some local state in your top most component and tweaking the `configureStore` function a bit, so that it can notify your root React component to render the whole application when the required initialisation has taken place. In this case, by initialisation, we are talking about rehydrating the store from disk and detecting initial internet connection.

As you can see in the snippets below, we create the `store` instance as usual and return it in our `configureStore` function. The only difference is that the function is still _alive_ and will invoke the callback as soon as 2 actions are dispatched into the store (in order):
- `REHYDRATE` from `redux-persist`
- `CONNECTION_CHANGE ` from `react-native-offline`

```js
// configureStore.js
import { AsyncStorage, Platform, NetInfo } from 'react-native';
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { createNetworkMiddleware, offlineActionTypes, checkInternetConnection } from 'react-native-offline';
import rootReducer from '../reducers';

const networkMiddleware = createNetworkMiddleware();

export default function configureStore(callback) {
  const store = createStore(
    rootReducer,
    undefined,
    compose(
      applyMiddleware(networkMiddleware),
      autoRehydrate(),
    ),
  );
  // https://github.com/rt2zz/redux-persist#persiststorestore-config-callback
  persistStore(
    store,
    {
      storage: AsyncStorage,
      debounce: 500,
    },
    () => {
      // After rehydration completes, we detect initial connection
      checkInternetConnection().then(isConnected => {
        store.dispatch({
          type: offlineActionTypes.CONNECTION_CHANGE,
          payload: isConnected,
        });
        callback(); // Notify our root component we are good to go, so that we can render our app
      });
    },
  );

  return store;
}
```

Then, our root React component will have some local state, that initially will impose the component to return `null`, waiting until the async operations complete. Then, we trigger a `setState` to render the application.

```js
// App.js
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import configureStore from './store';
import Root from './Root';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      store: configureStore(() => this.setState({ isLoading: false })),
    };
  }

  render() {
   if (this.state.isLoading) return null;

    return (
      <Provider store={this.state.store}>
        <Root />
      </Provider>
    );
  }
}

export default App;
```

This way, we make sure the right actions are dispatched before anything else can be.

#### How to intercept and queue actions when the server responds with client (4xx) or server (5xx) errors
You can do that by dispatching yourself an action of type `@@network-connectivity/FETCH_OFFLINE_MODE`. The action types the library uses are exposed under `offlineActionTypes` property.

Unfortunately, the action creators are not exposed yet, so I'll release soon a new version with that fixed. In the meantime, you can check that specific action creator in  [here](https://github.com/rauliyohmc/react-native-offline/blob/master/src/actionCreators.js#L18), so that you can emulate its payload. That should queue up your action properly.

```js
import { offlineActionTypes } from 'react-native-offline';
...
fetch('someurl/data').catch(error => {
  dispatch({
    type: actionTypes.FETCH_OFFLINE_MODE,
    payload: {
      prevAction: {
        type: action.type, // <-- action is the one that triggered your api call
        payload: action.payload,
      },
    },
    meta: { retry: true }
  })
);
```

#### How to persist and rehydrate thunks in the offline queue with Redux Persist

Due to the way Redux Persist serializes the store, persisting and rehydrating thunks will return an invalid action. Fortunately, there is a workaround.

In your action creator, make sure to format it as specified from the [thunks config](https://github.com/rauliyohmc/react-native-offline#thunks-config) with a couple of additions.
```javascript
// actions.js

export const fetchUser = (url) => {
  function thunk(dispatch) {
    fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        dispatch({type: FETCH_USER_SUCCESS, payload: responseJson});
      })
      .catch((error) => {
        console.error(error);
      });
  };

  thunk.interceptInOffline = true;
  
  // Add these
  thunk.meta = {
    retry: true, 
    name: 'fetchUser', // This should be the name of your function
    args: [url], // These are the arguments for the function. Add more as needed.
  };
  return thunk;
};
```
Add the following into your redux store. Refer to the [transforms](https://github.com/rt2zz/redux-persist#transforms) section for more information on how Redux Persist transforms data.

```javascript
// store.js

import { fetchUser } from './actions.js';
import { fetchOtherUsers } from './otherActions.js';

// We have to map our actions to an object
const actions = {
  fetchUser,
  fetchOtherUsers,
};

// Transform how the persistor reads the network state
const networkTransform = createTransform(
  (inboundState, key) => {
    const actionQueue = [];

    inboundState.actionQueue.forEach(action => {
      if (typeof action === 'function') {
        actionQueue.push({
          function: action.meta.name,
          args: action.meta.args,
        });
      } else if (typeof action === 'object') {
        actionQueue.push(action);
      }
    });

    return {
      ...inboundState,
      actionQueue,
    };
  },
  (outboundState, key) => {
    const actionQueue = [];

    outboundState.actionQueue.forEach(action => {
      if (action.function) {
        const actionFunction = actions[action.function];
        actionQueue.push(actionFunction(...action.args));
      } else {
        actionQueue.push(action);
      }
    });

    return { ...outboundState, actionQueue };
  },
  // The 'network' key may change depending on what you
  // named your network reducer.
  { whitelist: ['network'] }, 
);

const persistConfig = {
  key: 'root',
  storage,
  transforms: [networkTransform], // Add the transform into the persist config
};
```

### Inspiration
Thanks to Spencer Carli for his awesome article about [Handling Offline actions in React Native](https://medium.com/differential/handling-offline-actions-in-react-native-74949cbfabf2), which served me as inspiration for the offline queue implementation.

### License
MIT
