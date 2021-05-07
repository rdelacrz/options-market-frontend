import { Saga } from 'redux-saga';
import { all, call, spawn } from 'redux-saga/effects';

import fundInfoSaga from './fundInfo.saga';
import routingSaga from './routing.saga';

export default function* rootSaga () {
  // Place sagas from other files here
  const sagas: Saga[] = [
    fundInfoSaga,
    routingSaga,
  ];

  yield all(sagas.map(saga =>
    spawn(function* () {
      while (true) {
        try {
          yield call(saga);
          break
        } catch (e) {
          console.log(e)
        }
      }
    }))
  );
}