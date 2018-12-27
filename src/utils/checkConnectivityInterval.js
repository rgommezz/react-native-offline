// @flow

let interval = null;

export function getInterval() {
  return interval;
}

export function setup(checkFn: Function, t: number) {
  if (t > 0 && !interval) {
    interval = setInterval(checkFn, t);
  }
}

export function clear() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
