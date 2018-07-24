/**
 * @flow
 */
import { isEqual } from 'lodash';

/**
 * Finds and returns a similar thunk or action in the actionQueue.
 * Else undefined.
 * @param action
 * @param actionQueue
 */
export default function similarActionCheck(
  action: FluxActionWithPreviousIntent,
  actionQueue: Array<*>,
) {
  const { prevAction, prevThunk } = action.payload;

  if (typeof prevAction === 'object') {
    return actionQueue.find((queued: *) => isEqual(queued, action));
  } else if (prevThunk === 'function') {
    return actionQueue.find(
      (queued: *) => action.toString() === queued.toString(),
    );
  }
  return undefined;
}
