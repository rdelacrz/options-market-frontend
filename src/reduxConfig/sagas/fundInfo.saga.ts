import { takeLatest, put, select } from 'redux-saga/effects';
import { ActionType, updateFunds } from '../actions';


function* getFundsList() {
  // TO IMPLEMENT: Link to service that gets ethereum fund data
  yield put(updateFunds([]));
}

export default function * fundInfoSaga() {
  yield takeLatest(ActionType.GET_FUNDS_LIST, getFundsList)
}