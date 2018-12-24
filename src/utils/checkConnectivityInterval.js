// @flow

let interval = null;

export function getInterval() {
  return interval;
}

export function setup(
  connectivityCheck: Function,
  checkConnectionInterval: number,
) {
  if (checkConnectionInterval > 0 && !interval) {
    interval = setInterval(connectivityCheck, checkConnectionInterval);
  }
}

export function clear() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
