const initialCount = 0;

const countReducer = (state = initialCount, action) => {
  if (action.type === 'ADD_ONE') {
    return state + 1;
  }
  if (action.type === 'SUB_ONE') {
    return state - 1;
  }
  return state;
};

export default countReducer;
