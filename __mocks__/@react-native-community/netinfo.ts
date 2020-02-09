export default {
  addEventListener: jest.fn(),
  fetch: jest.fn(state => Promise.resolve(state)),
};
