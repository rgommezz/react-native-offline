module.exports = {
  get NetworkProvider() {
    return require('./components/NetworkProvider').default;
  },
  get ReduxNetworkProvider() {
    return require('./components/ReduxNetworkProvider').default;
  },
  get NetworkConsumer() {
    return require('./components/NetworkConsumer').default;
  },
  get reducer() {
    return require('./redux/createReducer').default();
  },
  get createReducer() {
    return require('./redux/createReducer').default;
  },
  get createNetworkMiddleware() {
    return require('./redux/createNetworkMiddleware').default;
  },
  get offlineActionTypes() {
    return require('./redux/actionTypes').default;
  },
  get offlineActionCreators() {
    return require('./redux/actionCreators').default;
  },
  get networkSaga() {
    return require('./redux/sagas').default;
  },
  get checkInternetConnection() {
    return require('./utils/checkInternetConnection').default;
  },
};
