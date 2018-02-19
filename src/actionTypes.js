/* @flow */

type ActionTypes = {|
  CONNECTION_CHANGE: '@@network-connectivity/CONNECTION_CHANGE',
  FETCH_OFFLINE_MODE: '@@network-connectivity/FETCH_OFFLINE_MODE',
  REMOVE_FROM_ACTION_QUEUE: '@@network-connectivity/REMOVE_FROM_ACTION_QUEUE',
  DISMISS_ACTIONS_FROM_QUEUE: '@@network-connectivity/DISMISS_ACTIONS_FROM_QUEUE',
  CHECK_CONNECTIVITY: '@@network-connectivity/CHECK_CONNECTIVITY',
|};

const actionTypes: ActionTypes = {
  CONNECTION_CHANGE: '@@network-connectivity/CONNECTION_CHANGE',
  FETCH_OFFLINE_MODE: '@@network-connectivity/FETCH_OFFLINE_MODE',
  REMOVE_FROM_ACTION_QUEUE: '@@network-connectivity/REMOVE_FROM_ACTION_QUEUE',
  DISMISS_ACTIONS_FROM_QUEUE:
    '@@network-connectivity/DISMISS_ACTIONS_FROM_QUEUE',
  CHECK_CONNECTIVITY: '@@network-connectivity/CHECK_CONNECTIVITY',
};

export default actionTypes;
