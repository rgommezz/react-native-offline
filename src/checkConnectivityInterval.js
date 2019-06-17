// @flow

let interval = null;

export const setupConnectivityCheckInterval = (
  connectivityCheck: Function,
  checkConnectionInterval: number,
) => {
  if (checkConnectionInterval && !interval) {
    interval = setInterval(connectivityCheck, checkConnectionInterval);
  }
};

export const clearConnectivityCheckInterval = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
};
