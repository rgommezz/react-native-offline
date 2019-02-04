# react-native-offline
[![All Contributors](https://img.shields.io/badge/all_contributors-30-orange.svg?style=flat-square)](#contributors)
[![CircleCI](https://circleci.com/gh/rgommezz/react-native-offline.svg?style=shield)](https://circleci.com/gh/rgommezz/react-native-offline) [![npm version](https://badge.fury.io/js/react-native-offline.svg)](https://badge.fury.io/js/react-native-offline) [![Coverage Status](https://coveralls.io/repos/github/rauliyohmc/react-native-offline/badge.svg?branch=master)](https://coveralls.io/github/rauliyohmc/react-native-offline?branch=master)
[![npm](https://img.shields.io/npm/dm/react-native-offline.svg)]()

Handful of utilities you should keep in your toolbelt to handle offline/online connectivity in React Native. It supports iOS, Android and Windows platforms. You can leverage all the functionalities provided or just the ones that suits your needs, the modules are conveniently decoupled.

## Important (Please read)
**This is the documentation for version 4.x.x. If you are migrating from v3 to v4, check the [release notes](https://github.com/rgommezz/react-native-offline/releases/tag/v4.0.0).**

## Example app
A comprehensive [example app](/example) is available within Expo to play with the library and better understand its different modules. [Go and check it out!](https://exp.host/@rgommezz/react-native-offline-example)

## Contents

* [Motivation](#motivation)
* [Features](#features)
* [Contributions](#contributions)
* [Sponsors](#sponsors)
* [Installation](#installation)
* [API](#api)
  * [Component Utilities](#component-utilities)
    + [`NetworkProvider`](#networkprovider)
    + [`NetworkConsumer`](#networkconsumer)
  * [Integration with Redux](#integration-with-redux)
    + [`Network reducer`](#network-reducer)
    + [`ReduxNetworkProvider`](#reduxnetworkprovider)
    + [`networkSaga`](#networksaga)
    + [`createNetworkMiddleware`](#createnetworkmiddleware)
    + [`Offline Queue`](#offline-queue)
  * [Other Utilities](#other-utilities)
    + [`checkInternetConnection`](#checkinternetconnection)
* [Miscellanea](#miscellanea)
  * [FAQ](#faq)
    + [Testing offline behaviour](#how-to-test-offline-behavior-while-actually-being-online)
    + [Dispatching CONNECTION_CHANGE as 1st action on app startup](#how-to-orchestrate-redux-to-dispatch-connection_change-as-the-first-action-when-the-app-starts-up)
    + [Intercept and queue actions based off server errors](#how-to-intercept-and-queue-actions-when-the-server-responds-with-client-4xx-or-server-5xx-errors)
    + [Persist and rehydrate thunks in the offline queue](#how-to-persist-and-rehydrate-thunks-in-the-offline-queue-with-redux-persist)
    + [Using redux-saga 1.0.0-beta.x](#using-redux-saga-100-betax)
  * [Inspiration](#inspiration)
  * [License](#license)
  * [Contributors](#contributors)

## Motivation
When you are building your React Native app, you have to expect that some users may use your application in offline mode, for instance when travelling on a Plane (airplane mode) or the underground (no signal). How does your app behave in that situation? Does it show an infinite loader? Can the user still use it seamlessly?

Having an offline first class citizen app is very important for a successful user experience. React Native ships with the `NetInfo` module in order to detect internet connectivity. The API is pretty basic and it may be sufficient for small apps but its usage gets cumbersome as your app grows. Besides that, it only detects network connectivity and does not guarantee internet access so it can provide false positives.

This library aims to gather a variety of modules that follow React and Redux best practises, in order to make your life easier when it comes to deal with internet connectivity in your React Native application.

## Features
- Offline/online conditional rendering through **Provider/Consumer** components that leverage the **new React Context API**
- Reducer to keep your connectivity state in the Redux store
- **Redux middleware to intercept internet request actions in offline mode and apply DRY principle**
- Compatibility with async middleware libraries like redux-thunk, redux-saga and redux-observable
- A **saga** to place the network event subscriptions **outside of your components**
- A step further than `NetInfo` **detecting internet access besides network connectivity**
- **Offline queue support to automatically re-dispatch actions when connection is back online** or dismiss actions based on other actions dispatched (i.e navigation related)
- Ability to check connectivity regularly
- **100% unit test coverage**

## Contributions
PRs are more than welcome. If you're planning to contribute please make sure to read the contributing guide: [CONTRIBUTING.md](https://github.com/rgommezz/react-native-offline/blob/master/CONTRIBUTING.md)

## Sponsors
If you use this library on your commercial/personal projects, you can help us by funding the work on specific issues that you choose by using IssueHunt.io!

This gives you the power to prioritize our work and support the project contributors. Moreover it'll guarantee the project will be updated and maintained in the long run.

> Sponsors will be listed in the contributors section at the bottom. If you want to be removed please contact me at: rauliyohmc@gmail.com

[![issuehunt-image](https://camo.githubusercontent.com/f5f88939f6c627454b7c5d0eaef9f7cc40cc9586/68747470733a2f2f697373756568756e742e696f2f7374617469632f656d6265642f697373756568756e742d627574746f6e2d76312e737667)](https://issuehunt.io/repos/86369462)

## Installation
This library supports React Native v0.55 or higher. You also need to have `react-redux` version 6.x.x installed.
```
$ yarn add react-native-offline
```

#### Android
This library uses the `NetInfo` module from React Native underneath the hood. To request network info in Android an extra step is required, so you should add the following line to your app's `AndroidManifest.xml` as well:

`<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`

## API

### Component Utilities
In order to render stuff conditionally with ease. They internally listen to connection changes and also provide an extra layer of reliability by ensuring there is internet access when reporting online. For that, an extra request is made to a remote server.

#### `NetworkProvider`
Provider component that injects the network state to children components via [React Context](https://reactjs.org/docs/context.html). Only children prop is required, the rest are optional. It should be used on top of your components hierarchy, ideally in (or close to) the entry point.

```js

type Props = {
    children: React.Node,
    pingTimeout?: number = 10000,
    pingServerUrl?: string = 'https://www.google.com/',
    shouldPing?: boolean = true,
    pingInterval?: number = 0,
    pingOnlyIfOffline?: boolean = false,
    pingInBackground?: boolean = false,
    httpMethod?: HTTPMethod = 'HEAD',
}
```

##### Config
`children`:  a React Element. This is the only required prop.

`pingTimeout`: amount of time (in ms) that the component should wait for the ping response. Defaults to `10000` ms. If you want to use a different value, it's recommended to use a higher one.

`pingServerUrl`: remote server to ping to. Defaults to `https://www.google.com/` since it's probably one the most stable servers out there, but you can provide your own if needed.

`shouldPing`: flag that denotes whether the extra ping check will be performed or not. Defaults to `true`.

`pingInterval`: the interval (in ms) you want to ping the server at. Defaults to `0`, and that means it is not going to check connectivity regularly. If opted in, it's advised not to choose a very small value, because that may drain your battery. Choose wisely. Something around 30000 ms should be fine.

`pingOnlyIfOffline`: when set to `true` and `pingInterval` > 0, it will ping the remote server regularly only if offline. Defaults to `false`.

`pingInBackground`: whether or not to check connectivity when app isn't in the foreground. Defaults to `false`.

`httpMethod`: http method used to ping the server. Supports HEAD or OPTIONS. Defaults to `HEAD`.

##### Usage
```js
// index.js
import React from 'react';
import { NetworkProvider } from 'react-native-offline';
import App from './App';

const Root = () => (
  <NetworkProvider>
    <App />
  </NetworkProvider>
);

export default Root;
```

#### `NetworkConsumer`
React component that subscribes to connectivity changes. It requires a function as a child. The function receives the current connectivity status and returns a React node. **This component should be rendered within a NetworkProvider in order to work properly**.

##### Props
```js
type NetworkState = {
  isConnected: boolean,
}

type Props = {
  children: ({ isConnected }: NetworkState) => React.Node
}
```

##### Usage
```js
import React from 'react';
import { Image, Button, Text } from 'react-native';
import { NetworkConsumer } from 'react-native-offline';

const ImageViewer = () => (
  <View>
    <Image src="foo.com" />
    <NetworkConsumer>
      {({ isConnected }) => (
        isConnected ? (
          <Button title="Download image" onPress={downloadImage} />
        ) : (
          <Text>Downloading images is disabled since you are offline</Text>
        )
      )}
    </NetworkConsumer>
  </View>
);
```

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

##### `ReduxNetworkProvider`
Uses a provider component mechanism. The same [props](#config) as for `NetworkProvider` apply. Make sure your component is a descendant of the react-redux `<Provider>` component, so that `ReduxNetworkProvider` has access to the store.

```js
// Root.js
import store from './reduxStore';
import React from 'react';
import { Provider } from 'react-redux';
import { ReduxNetworkProvider } from 'react-native-offline';

let App = () => (
  <Navigator>
    <MainScreen />
    <OtherScreen />
  </Navigator>
);

const Root = () => (
  <Provider store={store}>
    <ReduxNetworkProvider>
      <App />
    </ReduxNetworkProvider>
  </Provider>
);
```

##### `networkSaga`
Just fork this saga from your root saga. It accepts the same [config](#config) options as `NetworkProvider` and `ReduxNetworkProvider`. Recommended if you are using redux-saga, since it's a very elegant way to deal with global connectivity changes, without having to wrap your components with extra functionality.

```js
// rootSaga.js
import { all } from 'redux-saga/effects';
import saga1 from './saga1';
import saga2 from './saga2';
import { networkSaga } from 'react-native-offline';

export default function* rootSaga(): Generator<*, *, *> {
  yield all([
    fork(saga1),
    fork(saga2),
    fork(networkSaga, { pingInterval: 20000 }),
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
Function that returns a Redux middleware which listens to specific actions targeting API calls in online/offline mode.

```js
createNetworkMiddleware(config: MiddlewareConfig): ReduxMiddleware

type MiddlewareConfig = {
  regexActionType?: RegExp = /FETCH.*REQUEST/,
  actionTypes?: Array<string> = [],
  queueReleaseThrottle?: number = 50,
}
```

##### PO Config
This is the setup you need to put in place for libraries such as `redux-saga` or `redux-observable`, which rely on plain actions being dispatched to trigger async flow:

`regexActionType`: regular expression to indicate the action types to be intercepted in offline mode.
By default it's configured to intercept actions for fetching data following the Redux [convention](https://redux.js.org/docs/advanced/AsyncActions.html). That means that it will intercept actions with types such as `FETCH_USER_ID_REQUEST`, `FETCH_PRODUCTS_REQUEST` etc.

`actionTypes`: array with additional action types to intercept that don't fulfil the RegExp criteria. For instance, it's useful for actions that carry along refreshing data, such as `REFRESH_LIST`.

`queueReleaseThrottle`: waiting time in ms between dispatches when flushing the offline queue. Useful to reduce the server pressure when coming back online. Defaults to 50ms.

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
const networkMiddleware = createNetworkMiddleware({
  queueReleaseThrottle: 200,
});

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

**Note**: It's recommended to always set `shouldPing` to `true` (the default behaviour), in order to prevent inconsistent behaviour on iOS for RN < 0.57.
```js
checkInternetConnection(
  url?: string = 'https://www.google.com/',
  pingTimeout?: number = 10000,
  shouldPing?: boolean = true
): Promise<boolean>
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
You can use `pingServerUrl` and set it to a non existing url or point to some server that is down. Don't forget to also set `shouldPing` to `true` (which is the default behaviour).

Don't rely too much on iOS simulators and switching on/off the internet connection on your computer, they are quite buggy and report inconsistent connectivity information. On the other hand, testing on real devices should be fine.

#### How to orchestrate Redux to dispatch `CONNECTION_CHANGE` as the first action when the app starts up
The solution assumes you are using Redux Persist v5.x and involves using some local state in your top most component and tweaking the `configureStore` function a bit, so that it can notify your root React component to render the whole application when the required initialisation has taken place. In this case, by initialisation, we are talking about rehydrating the store from disk and detecting initial internet connection.

As you can see in the snippets below, we create the `store` instance as usual and return it in our `configureStore` function. The only difference is that the function is still _alive_ and will invoke the callback as soon as 2 actions are dispatched into the store (in order):
- `REHYDRATE` from `redux-persist`
- `CONNECTION_CHANGE ` from `react-native-offline`

```js
// configureStore.js
import { createStore, applyMiddleware } from 'redux';
import { persistStore } from 'redux-persist';
import { createNetworkMiddleware, offlineActionTypes, checkInternetConnection } from 'react-native-offline';
import rootReducer from '../reducers';

const networkMiddleware = createNetworkMiddleware();

export default function configureStore(callback) {
  const store = createStore(rootReducer, applyMiddleware(networkMiddleware));
  // https://github.com/rt2zz/redux-persist#persiststorestore-config-callback
  persistStore(store, null, () => {
    // After rehydration completes, we detect initial connection
    checkInternetConnection().then(isConnected => {
      store.dispatch({
        type: offlineActionTypes.CONNECTION_CHANGE,
        payload: isConnected,
      });
      callback(); // Notify our root component we are good to go, so that we can render our app
    });
  });

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

Unfortunately, the action creators are not exposed yet, so I'll release soon a new version with that fixed. In the meantime, you can check that specific action creator in  [here](https://github.com/rgommezz/react-native-offline/blob/master/src/actionCreators.js#L18), so that you can emulate its payload. That should queue up your action properly.

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

In your action creator, make sure to format it as specified from the [thunks config](https://github.com/rgommezz/react-native-offline#thunks-config) with a couple of additions.
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

#### Using redux-saga 1.0.0-beta.x
If you are using a `1.0.0-beta.x` version for redux-saga in your application, you may have some conflicts when yarn install dependencies, since this library relies on the latest stable version `0.16.2` and that could take precedence on your `node_modules`. In order to fix it, you can use [yarn resolutions](https://yarnpkg.com/lang/en/docs/selective-version-resolutions) by adding the next lines of code to your `package.json`, where `x` is the beta version number:

```json
  "resolutions": {
    "react-native-offline/redux-saga": "^1.0.0-beta.x"
  },
```

### Inspiration
Thanks to Spencer Carli for his awesome article about [Handling Offline actions in React Native](https://medium.com/differential/handling-offline-actions-in-react-native-74949cbfabf2), which served me as inspiration for the offline queue implementation.

### License
MIT

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars0.githubusercontent.com/u/4982414?v=4" width="100px;"/><br /><sub><b>Raúl Gómez Acuña</b></sub>](https://twitter.com/rgommezz)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=rgommezz "Code") [📖](https://github.com/rgommezz/react-native-offline/commits?author=rgommezz "Documentation") [💡](#example-rgommezz "Examples") [🤔](#ideas-rgommezz "Ideas, Planning, & Feedback") [👀](#review-rgommezz "Reviewed Pull Requests") [💬](#question-rgommezz "Answering Questions") | [<img src="https://avatars0.githubusercontent.com/u/739075?v=4" width="100px;"/><br /><sub><b>Piotrek Witek</b></sub>](https://github.com/piotrwitek)<br />[📖](https://github.com/rgommezz/react-native-offline/commits?author=piotrwitek "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/2392118?v=4" width="100px;"/><br /><sub><b>Adrien Thiery</b></sub>](http://www.thiery.io)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=adrienthiery "Code") [📖](https://github.com/rgommezz/react-native-offline/commits?author=adrienthiery "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/6321988?v=4" width="100px;"/><br /><sub><b>Hasibullah Sahibzada</b></sub>](https://github.com/hasibsahibzada)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=hasibsahibzada "Code") | [<img src="https://avatars3.githubusercontent.com/u/1972353?v=4" width="100px;"/><br /><sub><b>Marco Wettstein</b></sub>](https://www.linkedin.com/in/marco-wettstein-b1b8938b?trk=hp-identity-name)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=macrozone "Code") | [<img src="https://avatars1.githubusercontent.com/u/1098636?v=4" width="100px;"/><br /><sub><b>Kent Cederström</b></sub>](http://kentcederstrom.se)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=kentos "Code") | [<img src="https://avatars0.githubusercontent.com/u/16093452?v=4" width="100px;"/><br /><sub><b>Richard V. Lam</b></sub>](https://richardvclam.github.io)<br />[📖](https://github.com/rgommezz/react-native-offline/commits?author=richardvclam "Documentation") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars1.githubusercontent.com/u/1300393?v=4" width="100px;"/><br /><sub><b>Thomas Bosch</b></sub>](http://www.codecentric.de)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=dickerpulli "Code") [📖](https://github.com/rgommezz/react-native-offline/commits?author=dickerpulli "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/1828134?v=4" width="100px;"/><br /><sub><b>cinan</b></sub>](http://blog.cinan.sk)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=cinan "Code") | [<img src="https://avatars2.githubusercontent.com/u/3830084?v=4" width="100px;"/><br /><sub><b>Colon D</b></sub>](https://github.com/YKSing)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=YKSing "Code") | [<img src="https://avatars1.githubusercontent.com/u/10877466?v=4" width="100px;"/><br /><sub><b>Stephen Kempin</b></sub>](http://www.stephenkempin.co.uk)<br />[📖](https://github.com/rgommezz/react-native-offline/commits?author=SKempin "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/5890860?v=4" width="100px;"/><br /><sub><b>Thomas Scharke</b></sub>](https://www.linkedin.com/in/tscharke/)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=tscharke "Code") [📖](https://github.com/rgommezz/react-native-offline/commits?author=tscharke "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/570829?v=4" width="100px;"/><br /><sub><b>felipemartim</b></sub>](https://github.com/felipemartim)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=felipemartim "Code") [📖](https://github.com/rgommezz/react-native-offline/commits?author=felipemartim "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/16226376?v=4" width="100px;"/><br /><sub><b>Mehdi A.</b></sub>](http://WIP)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=maieonbrix "Code") |
| [<img src="https://avatars0.githubusercontent.com/u/1212381?v=4" width="100px;"/><br /><sub><b>Can OMUR</b></sub>](https://github.com/comur)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=comur "Code") | [<img src="https://avatars3.githubusercontent.com/u/5470392?v=4" width="100px;"/><br /><sub><b>Mark van Lagen</b></sub>](http://nijhuisenvanlagen.nl)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=markvl91 "Code") | [<img src="https://avatars2.githubusercontent.com/u/2320535?v=4" width="100px;"/><br /><sub><b>George Farro</b></sub>](https://github.com/gtfargo)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=gtfargo "Code") | [<img src="https://avatars2.githubusercontent.com/u/444063?v=4" width="100px;"/><br /><sub><b>Mickaël Leduque</b></sub>](https://github.com/mleduque)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=mleduque "Code") | [<img src="https://avatars3.githubusercontent.com/u/1901827?v=4" width="100px;"/><br /><sub><b>Florent Roques</b></sub>](https://stackoverflow.com/users/1152843/florent-roques?tab=profile)<br />[📖](https://github.com/rgommezz/react-native-offline/commits?author=florentroques "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/6444719?v=4" width="100px;"/><br /><sub><b>Krzysztof Borowy</b></sub>](https://github.com/Krizzu)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=Krizzu "Code") [📖](https://github.com/rgommezz/react-native-offline/commits?author=Krizzu "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/1548421?v=4" width="100px;"/><br /><sub><b>Thomas Deconinck</b></sub>](http://www.thomasdeconinck.fr)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=DCKT "Code") [📖](https://github.com/rgommezz/react-native-offline/commits?author=DCKT "Documentation") |
| [<img src="https://avatars2.githubusercontent.com/u/5106466?v=4" width="100px;"/><br /><sub><b>Michał Pierzchała</b></sub>](https://buymeacoff.ee/thymikee)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=thymikee "Code") | [<img src="https://avatars3.githubusercontent.com/u/119142?v=4" width="100px;"/><br /><sub><b>Ian Graham</b></sub>](https://github.com/imartingraham)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=imartingraham "Code") | [<img src="https://avatars2.githubusercontent.com/u/1244867?v=4" width="100px;"/><br /><sub><b>Petter Samuelsen</b></sub>](http://www.pettersamuelsen.com)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=pettersamuelsen "Code") | [<img src="https://avatars1.githubusercontent.com/u/5339061?v=4" width="100px;"/><br /><sub><b>Lukas Kurucz</b></sub>](https://github.com/usrbowe)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=usrbowe "Code") | [<img src="https://avatars1.githubusercontent.com/u/18237132?v=4" width="100px;"/><br /><sub><b>Norris Oduro</b></sub>](https://twitter.com/norris1z)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=Norris1z "Code") | [<img src="https://avatars3.githubusercontent.com/u/43637878?v=4" width="100px;"/><br /><sub><b>Richard Tan</b></sub>](https://github.com/richardtks)<br />[🤔](#ideas-richardtks "Ideas, Planning, & Feedback") | [<img src="https://avatars3.githubusercontent.com/u/17765105?v=4" width="100px;"/><br /><sub><b>Oleg Kupriianov</b></sub>](https://twitter.com/tysh_pysh)<br />[💻](https://github.com/rgommezz/react-native-offline/commits?author=Jimbomaniak "Code") |
| [<img src="https://avatars1.githubusercontent.com/u/11155505?v=4" width="100px;"/><br /><sub><b>reilem</b></sub>](https://github.com/reilem)<br />[🤔](#ideas-reilem "Ideas, Planning, & Feedback") | [<img src="https://avatars1.githubusercontent.com/u/8154741?v=4" width="100px;"/><br /><sub><b>Josephine Wright</b></sub>](https://github.com/jozr)<br />[📖](https://github.com/rgommezz/react-native-offline/commits?author=jozr "Documentation") |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
