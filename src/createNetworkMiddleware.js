import { FETCH_OFFLINE_MODE } from './actionTypes';

function createNetworkMiddleware({ regexActionType = /FETCH.*REQUEST/, regexActionName = /fetch/, actionTypes = [] }) {
  return ({ getState }) => next => (action) => {
    const connectionState = getState().network.isConnected;
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
    // Variables and methods can infer the name of an anonymous function from its syntactic position (new in ECMAScript 2015)
    const isFunctionAndMatchCondition = typeof action === 'function' && regexActionName.test(action.name) && !connectionState;

    const isObjectAndMatchCondition = typeof action === 'object' && (regexActionType.test(action.type) || actionTypes.includes(action.type)) && !connectionState;

    if (isFunctionAndMatchCondition || isObjectAndMatchCondition) {
      return next({
        type: FETCH_OFFLINE_MODE,
        payload: {
          prevActionType: action.type,
          prevActionPayload: action.payload,
        },
      });
    }
    return next(action);
  };
}

export default createNetworkMiddleware;
