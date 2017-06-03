# react-native-offline-utils

[![CircleCI](https://circleci.com/gh/rauliyohmc/react-native-offline-utils.svg?style=shield)](https://circleci.com/gh/rauliyohmc/react-native-offline-utils) [![npm version](https://badge.fury.io/js/react-native-offline-utils.svg)](https://badge.fury.io/js/react-native-offline-utils) [![Coverage Status](https://coveralls.io/repos/github/rauliyohmc/react-native-offline-utils/badge.svg?branch=master)](https://coveralls.io/github/rauliyohmc/react-native-offline-utils?branch=master)

Handful of utilities you should keep in your toolbelt to handle offline/online connectivity in React Native. It supports both iOS and Android platforms. You can leverage all the functionalities provided or just the ones that suits your needs, the modules are conveniently decoupled.

If you wanna jump straight to the API:
* [Component Utilities](#component-utilities)
  + [`withNetworkConnectivity()`](#withnetworkconnectivity)
  + [`ConnectivityRenderer`](#connectivityrenderer)
* [Integration with Redux](#integration-with-redux)
  + [`Network reducer`](#network-reducer)
  + [`createNetworkMiddleware()`](#createnetworkmiddleware)
  + [`Offline Queue`](#offline-queue)



## Motivation
When you are building your React Native app, you have to expect that some users may use your application in offline mode, for instance when travelling on a Plane (airplane mode) or through underground (no signal). How does your app behaves in that situation? Does it show an infinite loader? Can the user still use it seamlessly?

Having an offline first class citizen app is very important for a successful user experience. This library aims to group together a variety of modules, whose end goal is to make your life easier when it comes to deal with internet connectivity in your React Native application.

## Features

- Offline/online conditional rendering through HOC or Render Callback techniques
- Reducer to keep your connectivity state in the Redux store
- Middleware to intercept internet request actions in offline mode
- Compatibility with async middleware libraries like redux-thunk, redux-saga and redux-observable
- Offline queue support to automatically re-dispatch actions when connection is back online or dismiss actions based on other actions dispatched (i.e navigation related)
- Typed with Flow

## Installation

```
$ yarn add react-native-offline-utils
```

#### Android
This library uses `NetInfo` module from React Native underneath the hood. To request network info in Android an extra step is required, so you should add the following line to your app's `AndroidManifest.xml` as well:

`<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`

## API

### Component Utilities

#### `withNetworkConnectivity()`

Higher order function that returns a higher order component (HOC). By default, the HOC injects connectivity status as a prop into the wrapped component. See Redux integration for a different config.

```js
withNetworkConnectivity(
  withConnectivityProp: boolean = true
): (WrappedComponent) => EnhancedComponent
```
##### Usage

```js
import React from 'react';
import { Text } from 'react-native';
import { withNetworkConnectivity } from 'react-native-offline-utils';

const YourComponent = ({ isConnected }) => (
  <Text>{isConnected ? 'Look ma, I am connected to the internet!' : 'Offline :('}</Text>
);

export default withNetworkConnectivity()(YourComponent);
```

#### `ConnectivityRenderer`

React component that accepts a function as children. It allows you to decouple your parent component and your child component, managing connectivity state on behalf of the components it is composed with, without making demands on how that state is leveraged by its children. Useful for conditionally render different children based on connectivity status.

##### Props
###### `children` (required)
A function that receives `isConnected` as argument.

##### Usage

```js
...
import { ConnectivityRenderer } from 'react-native-offline-utils';

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
    <View>
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

There are 3 features that this library provides in order to leverage offline capabilities in your redux store: a reducer, a middleware and an offline queue system. You can use all of them or just the ones that suits your needs.

### Network reducer
A network reducer to be provided to the store

#### State
```js
type NetworkState = {
  isConnected: boolean,
  actionQueue: Array<*>
}
```

#### Usage

##### 1.- Give the network reducer to redux

```js
// configureStore.js
import { createStore, combineReducers } from 'redux'
import { reducer as network } from 'react-native-offline-utils';

const rootReducer = combineReducers({
  // ... your other reducers here ...
  network,
});

const store = createStore(rootReducer);
export default store;
```

##### 2.- Wrap your top most React component into `withNetworkConnectivity` and configure it with `withConnectivityProp = false`

Make sure your component is a descendant of the react-redux `<Provider>` component, so that withNetworkConnectivity has access to the store.

```js
// Root.js
import store from './configureStore';
import React from 'react';
import { Provider } from 'react-redux';
import { withNetworkConnectivity } from 'react-native-offline-utils';

let App = () => (
  <Navigator>
    <MainScreen />
    <OtherScreen />
  </Navigator>
);

App = withNetworkConnectivity(false)(App); // Passing false won't inject isConnected as a prop in this case

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider
);
```

Now your network state can be accessed by any Redux container inside `mapStateToProps()`, as `state.network.isConnected`.

**Note**: If you wanna listen to the action dispatched internally in your reducers, import the offline action types and reference `CONNECTION_CHANGE`:
```js
import { offlineActionTypes } from 'react-native-offline-utils';
...
if(action.type === offlineActionTypes.CONNECTION_CHANGE) // do something in your reducer
...
```

#### `createNetworkMiddleware()`
Function that returns a redux middleware which listens to specific actions targetting API calls in online/offline mode.

```js
createNetworkMiddleware(config: Config): ReduxMiddleware

type Config = {
  regexActionType?: RegExp = /FETCH.*REQUEST/,
  regexFunctionName?: RegExp = /fetch/,
  actionTypes?: Array<string> = [] 
}
```

##### Params

`regexActionType`: regular expression for indicating the action types to be intercepted in offline mode.
By default it's configured to intercept actions for fetching data following the Redux [convention](http://redux.js.org/docs/advanced/AsyncActions.html). That means that it will intercept actions with types such as `FETCH_USER_ID_REQUEST`, `FETCH_PRODUCTS_REQUEST` etc.

`regexFunctionName`: only for redux-thunk, regular expression for specifying the thunk names you are interested to catch in offline mode. Since in ECMAScript 2015, variables and methods can infer the name of an anonymous function from its syntactic position, it's safe to use any sort of function style. It defaults to function names that contains the string "fetch", as `fetchUserId`.

`actionTypes`: array with additional action types to intercept that don't fulfil the RegExp criteria. For instance useful for actions that carry along refreshing data, such as `REFRESH_LIST`.

##### Usage

You should apply the middleware to the store using `applyMiddleware`. **The network middleware should be the first on the chain**, before any other middleware used for handling async actions, such as [redux-thunk](https://github.com/gaearon/redux-thunk), [redux-saga](https://github.com/redux-saga/redux-saga) or [redux-observable](https://github.com/redux-observable/redux-observable).

```js
import { createStore, applyMiddleware } from 'redux';
import { createNetworkMiddleware } from 'react-native-offline-utils';
import createSagaMiddleware from 'redux-saga';

const sagaMiddleware = createSagaMiddleware();
const networkMiddleware = createNetworkMiddleware();

const store = createStore(
  rootReducer,
  applyMiddleware([networkMiddleware, sagaMiddleware])
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
import { offlineActionTypes } from 'react-native-offline-utils';
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
- For thunks, append a `meta` property to the function with the same shape:

```js
function fetchThunk(dispatch, getState) {
  dispatch({ type: FETCH_USER_ID_REQUEST, payload: { id: '3' } });
  ...
}

fetchThunk.meta = {
  retry?: boolean, // By passing true, your thunk will be enqueued on offline mode
  dismiss?: Array<string> // Array of actions which, once dispatched, will trigger a dismissal from the queue
}
```

## License

MIT

