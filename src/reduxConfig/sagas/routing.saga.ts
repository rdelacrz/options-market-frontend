import { LOCATION_CHANGE } from 'connected-react-router';
import { takeLatest, put, select } from 'redux-saga/effects';
import { clearDataFetches } from '../actions';
import { State } from '../state';

/**
 * Clears list of pending data fetches if route changes.
 */
function* onLocationChange() {
  const pendingDataFetches: string[] = yield select((state: State) => state.globalSettings.pendingDataFetches);
  if (pendingDataFetches.length > 0) {
    yield put(clearDataFetches());
  }
}

export default function * routingSaga() {
  yield takeLatest(LOCATION_CHANGE, onLocationChange)
}