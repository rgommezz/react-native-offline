import { SAGA_ADD_ONE_TO_COUNT } from "../constants/saga";

// add the meta property to actions you want to queue
export const addOneToCount = function() {
  return {
    type: SAGA_ADD_ONE_TO_COUNT,
    meta: {
      retry: true, //you can pass a dismiss array prop with actions which when dispatched will remove the current action from the queue
    }
  };
};
