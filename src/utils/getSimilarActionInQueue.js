// @flow
import _ from 'lodash';

/**
 * Finds and returns a similar thunk or action in the actionQueue.
 * Else undefined.
 * @param action
 * @param actionQueue
 */
export default function getSimilarActionInQueue(
  action: *,
  actionQueue: Array<*>,
) {
  if (typeof action === 'object') {
    return actionQueue.find((queued: *) => _.isEqual(queued, action));
  }
  if (typeof action === 'function') {
    return actionQueue.find((queued: *) => {
      const isArgsEqual = _(action.meta.args)
        .xorWith(queued.meta.args, _.isEqual)
        .isEmpty();
      return action.toString() === queued.toString() && isArgsEqual;
    });
  }
  return undefined;
}
