import { fork, takeLatest, put } from "redux-saga/effects";
import { networkEventsListenerSaga } from "react-native-offline";
import { SAGA_ADD_ONE_TO_COUNT } from "../constants/saga";
import { ADD_ONE_TO_COUNT } from "../constants/redux";

function* addOneToCount() {
  yield put({
    type: ADD_ONE_TO_COUNT
  });
}

export default function* rootSaga() {
  yield fork(networkEventsListenerSaga, {
    checkConnectionInterval: 3000 //check every 3seconds
  });

  yield takeLatest(SAGA_ADD_ONE_TO_COUNT, addOneToCount); //map latest SAGA_ADD_ONE_TO_COUNT to the addOneToCount generator
}
