# react-native-network-connectivity

[![npm version](https://badge.fury.io/js/react-native-network-connectivity.svg)](https://badge.fury.io/js/react-native-network-connectivity)

Handful of utilities you should keep in your toolbelt to handle offline/online connectivity in React Native.

## Motivation
When you are building your React Native app, you have to expect that some users may use your application in offline mode, for instance when travelling on a Plane (airplane mode) or through underground (no signal). How does your app behaves in that situation? Does it show an infinite loader? Can the user still use it seamlessly?

Having an offline first class citizen app is very important for a successful user experience.
This library aims to group together a variety of modules, whose end goal is to make your life easier when it comes to deal with internet connectivity in your React Native application. The library supports both iOS and Android platforms and also integrates nicely with Redux, providing the convenient reducers and middleware so that you can sync up your connectivity state with your redux store.

## Features

- Managing connectivity through HOC or Render Callback components
- Reducer to keep your connectivity state in the Redux store
- Middleware to automatically handle fetch-request actions in offline mode
- Offline queue support to automatically dispatch actions when connection is back online

## API

### `withNetworkConnectivity()`

Function that returns a higher order component (HOC). By default, the HOC injects connectivity status as a prop into the wrapped component. See Redux integration for a different config.

```js
withNetworkConnectivity(
  withConnectivityProp = true?: boolean
): HigherOrderComponent
```
#### Usage

```js
import React from 'react';
import { Text } from 'react-native';
import { withNetworkConnectivity } from 'react-native-network-connectivity';

const YourComponent = ({ isConnected }) => (
  <Text>{isConnected ? 'Look ma, I am connected to the internet!' : 'Offline :('}</Text>
);

export default withNetworkConnectivity()(YourComponent);
```

### `ConnectivityRenderer`

React component that accepts a function as children. It allows you to decouple your parent component and your child component, managing connectivity state on behalf of the components it is composed with, without making demands on how that state is leveraged by its children. Useful for conditionally render different children based on connectivity status.

#### Props
##### `children` (required)
A function that receives `isConnected` as argument.

#### Usage

```js
...
import { ConnectivityRenderer } from 'react-native-network-connectivity';

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

## Integration with Redux

The are 3 features that this library provides in order to leverage offline capabilities in your redux store. You can use all of them or just the ones that suits your needs.

### Network reducer
A network reducer to be provided to the store

#### State
##### `isConnected: boolean`
##### `actionQueue: Array<ReduxActions>`

#### Usage

##### 1.- Give the network reducer to redux

```js
// configureStore.js
import { createStore, combineReducers } from 'redux'
import { reducer as network } from 'react-native-network-connectivity';

const rootReducer = combineReducers({
  // ... your other reducers here ...
  network,
});

const store = createStore(rootReducer);
export default store;
```

##### 2.- Wrap your top most React component into `withNetworkConnectivity` and configure it with `withConnectivityProp = false`

Make sure your component is a descendant of the react-redux `<Provider>` component, so that withNetworkConnectivity has access to the store

```js
// Root.js
import store from './configureStore';
import React from 'react';
import { Provider } from 'react-redux';
import { withNetworkConnectivity } from 'react-native-network-connectivity';

let App = () => (
  <Navigator>
    <MainScreen />
    <OtherScreen />
  </Navigator>
);

App = withNetworkConnectivity(false)(YourComponent); // Passing false won't inject isConnected as a prop in this case

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider
);
```

Now your network state can be accessed by any Redux container inside `mapStateToProps()`, as `state.network.isConnected`.

**Note**: If you wanna listen to the action dispatched internally in your reducers, you can import the action type as:
```js
import { CONNECTION_CHANGE } from 'react-native-network-connectivity';
```

### `createNetworkMiddleware()`
Middleware that listens to specific actions targetting API calls in online/offline mode.

```js
createNetworkMiddleware(
  regexActionType = /FETCH.*REQUEST/?: RegExp,
  actionTypes = []?: Array<string>
): reduxMiddleware
```

#### Params

`regexActionType`: regular expression for indicating the action types to be intercepted when we are offline.
By default it's configured to intercept actions for fetching data following the Redux [convention](http://redux.js.org/docs/advanced/AsyncActions.html). That means that it will intercept actions with types such as `FETCH_USER_ID_REQUEST`, `FETCH_PRODUCTS_REQUEST` etc.

`actionTypes`: array with additional action types to intercept that don't fulfil the RegExp criteria. For instance useful for actions that carry along refreshing data, such as `REFRESH_LIST`
