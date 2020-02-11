const getUUID = () => new Date().getUTCMilliseconds();

export const addOne = () => ({
  type: 'ADD_ONE',
  payload: getUUID(),
  meta: {
    retry: true,
  },
});
export type AddOneType = typeof addOne;

export const subOne = () => ({
  type: 'SUB_ONE',
  payload: getUUID(),
  meta: {
    retry: true,
  },
});
export type SubOneType = typeof subOne;

export const other = () => ({
  type: 'OTHER',
  meta: {
    retry: true,
    dismiss: ['CANCEL_OTHER'],
  },
});
export type OtherType = typeof other;

export const cancelOther = () => ({
  type: 'CANCEL_OTHER',
});
export type CancelOtherType = typeof cancelOther;
