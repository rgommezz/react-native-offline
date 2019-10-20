/* @flow */

type ActionTypes = {|
  CONNECTION_CHANGE: '@@network-connectivity/CONNECTION_CHANGE',
  FETCH_OFFLINE_MODE: '@@network-connectivity/FETCH_OFFLINE_MODE',
  REMOVE_FROM_ACTION_QUEUE: '@@network-connectivity/REMOVE_FROM_ACTION_QUEUE',
  DISMISS_ACTIONS_FROM_QUEUE: '@@network-connectivity/DISMISS_ACTIONS_FROM_QUEUE',
  CHANGE_QUEUE_SEMAPHORE: '@@network-connectivity/CHANGE_QUEUE_SEMAPHORE',
|};

const actionTypes: ActionTypes = {
  CONNECTION_CHANGE: '@@network-connectivity/CONNECTION_CHANGE',
  FETCH_OFFLINE_MODE: '@@network-connectivity/FETCH_OFFLINE_MODE',
  REMOVE_FROM_ACTION_QUEUE: '@@network-connectivity/REMOVE_FROM_ACTION_QUEUE',
  DISMISS_ACTIONS_FROM_QUEUE:
    '@@network-connectivity/DISMISS_ACTIONS_FROM_QUEUE',
  CHANGE_QUEUE_SEMAPHORE: '@@network-connectivity/CHANGE_QUEUE_SEMAPHORE',
};

export default actionTypes;
