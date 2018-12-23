// @flow

let interval = null;

export function setup(
  connectivityCheck: Function,
  checkConnectionInterval: number,
) {
  if (checkConnectionInterval && !interval) {
    interval = setInterval(connectivityCheck, checkConnectionInterval);
  }
}

export function clear() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
