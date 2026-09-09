import { all, fork, takeEvery, call, AllEffect, ForkEffect } from 'redux-saga/effects';
import { Alert } from 'react-native';
import { networkSaga } from 'react-native-offline';

function* doSideEffect({ type }: { type: string }) {
  yield call(
    [Alert, Alert.alert],
    type,
    'This is a fake side effect ONLY running on online mode',
  );
}

export default function* rootSaga(): Generator<
  AllEffect<ForkEffect<unknown>>,
  void,
  unknown
> {
  yield all([
    takeEvery(['ADD_ONE', 'SUB_ONE'], doSideEffect),
    fork(networkSaga),
  ]);
}
