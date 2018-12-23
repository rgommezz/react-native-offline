// @flow

let interval = null;

export const setup = (
  connectivityCheck: Function,
  checkConnectionInterval: number,
) => {
  if (checkConnectionInterval && !interval) {
    interval = setInterval(connectivityCheck, checkConnectionInterval);
  }
};

export const clear = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
};
