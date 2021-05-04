import { Saga } from 'redux-saga';
import { all, call, spawn } from 'redux-saga/effects';

import routingSaga from './routing.saga';

export function* rootSaga () {
  // Place sagas from other files here
  const sagas: Saga[] = [
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