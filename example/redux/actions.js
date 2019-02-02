const getUUID = () => new Date().getUTCMilliseconds();

export const addOne = () => ({
  type: 'ADD_ONE',
  payload: getUUID(),
  meta: {
    retry: true,
  },
});

export const subOne = () => ({
  type: 'SUB_ONE',
  payload: getUUID(),
  meta: {
    retry: true,
  },
});

export const noUI = () => ({
  type: 'NO_UI',
  meta: {
    retry: true,
  },
});
