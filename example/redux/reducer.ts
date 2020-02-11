import { SubOneType, AddOneType } from './actions';

const initialCount = 0;

const countReducer = (
  state = initialCount,
  action: ReturnType<SubOneType> | ReturnType<AddOneType>,
) => {
  if (action.type === 'ADD_ONE') {
    return state + 1;
  }
  if (action.type === 'SUB_ONE') {
    return state - 1;
  }
  return state;
};

export default countReducer;
