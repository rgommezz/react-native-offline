import { CONNECTION_CHANGE } from './actionTypes';

const initialState = {
  isConnected: true,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case CONNECTION_CHANGE:
      return { isConnected: action.payload };
    default:
      return state;
  }
}
