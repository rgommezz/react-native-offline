module.exports = {
  get reducer() {
    return require('./redux/reducer').default;
  },
  get withNetworkConnectivity() {
    return require('./components/NetworkConnectivity').default;
  },
  get createNetworkMiddleware() {
    return require('./redux/createNetworkMiddleware').default;
  },
  get offlineActionTypes() {
    return require('./redux/actionTypes').default;
  },
  get networkEventsListenerSaga() {
    return require('./redux/sagas').default;
  },
  get checkInternetConnection() {
    return require('./utils/checkInternetConnection').default;
  },
};
