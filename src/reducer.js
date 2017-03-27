export const CONNECTION_CHANGE = 'nc-CONNECTION_CHANGE';
export const FETCH_OFFLINE_MODE = 'nc-FETCH_OFFLINE_MODE';

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
