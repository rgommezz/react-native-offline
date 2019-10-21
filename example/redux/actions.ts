const getUUID = () => new Date().getUTCMilliseconds();

export const addOne = () => ({
  type: 'ADD_ONE',
  payload: getUUID(),
  meta: {
    retry: true,
  },
});
export type addOneType = typeof addOne;

export const subOne = () => ({
  type: 'SUB_ONE',
  payload: getUUID(),
  meta: {
    retry: true,
  },
});
export type subOneType = typeof subOne;

export const other = () => ({
  type: 'OTHER',
  meta: {
    retry: true,
    dismiss: ['CANCEL_OTHER'],
  },
});
export type otherType = typeof other;

export const cancelOther = () => ({
  type: 'CANCEL_OTHER',
});
export type cancelOtherType = typeof cancelOther;
