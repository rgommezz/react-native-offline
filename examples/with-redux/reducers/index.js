import { ADD_ONE_TO_COUNT } from "../constants/redux";

let defaultState = {
  count: 0
};

export default function(state = defaultState, action) {
  switch (action.type) {
    case ADD_ONE_TO_COUNT:
      return Object.assign({}, state, {
        count: state.count + 1
      });
    default:
      return state;
  }
}
