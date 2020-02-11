import { Dispatch } from 'redux';
import getSimilarActionInQueue from '../src/utils/getSimilarActionInQueue';

describe('getSimilarActionInQueue', () => {
  describe('action is an object', () => {
    const action1 = {
      type: 'foo',
      payload: {
        bar: 1,
      },
    };
    const action1Copy = {
      type: 'foo',
      payload: {
        bar: 1,
      },
    };
    const action2 = {
      type: 'foo',
      payload: {
        bar: 3,
      },
    };

    it('should return the action enqueued if it presents the same shape than some action passed', () => {
      expect(getSimilarActionInQueue(action1Copy, [action1])).toBe(action1);
    });

    it('should return undefined if the action enqueued does NOT present the same shape than the action passed', () => {
      expect(getSimilarActionInQueue(action1, [action2])).toBe(undefined);
    });
  });

  describe('action is a thunk', () => {
    const thunkFactory = (param: any) => {
      function thunk1(dispatch: Dispatch) {
        dispatch({ type: 'FETCH_DATA_REQUEST', payload: param });
      }
      return thunk1;
    };

    function thunk2(dispatch: Dispatch) {
      dispatch({ type: 'SOMETHING_ELSE' });
    }

    it(`should return the thunk enqueued if
     it presents the same shape than the thunk passed`, () => {
      const thunk = thunkFactory('foo');
      const thunkCopy = thunkFactory('bar');
      expect(getSimilarActionInQueue(thunkCopy, [thunk])).toBe(thunk);
      expect(getSimilarActionInQueue(thunk, [thunk])).toBe(thunk);
    });

    it(`should return undefined if the thunk enqueued
     does NOT present the same shape than the thunk passed`, () => {
      expect(getSimilarActionInQueue(thunkFactory('foo'), [thunk2])).toBe(
        undefined,
      );
    });
  });

  it('returns undefined if action JS type is something different', () => {
    expect(getSimilarActionInQueue(false, [])).toBe(undefined);
  });
});
