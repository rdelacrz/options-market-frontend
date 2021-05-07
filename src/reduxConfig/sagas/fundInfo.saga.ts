import { call, takeLatest, put, select } from 'redux-saga/effects';
import { ActionType, startFetchingData, finishFetchingData, updateFunds,  } from '../actions';
import environment from '@environment';
import { getMockFundList } from '@services';

function* getFundsList() {
  yield put(startFetchingData(ActionType.GET_FUNDS_LIST));

  if (environment.useMockData) {
    const mockFundList = yield call(getMockFundList);
    yield put(updateFunds(mockFundList));
  } else {
    // TO IMPLEMENT: Link to service that gets ethereum fund data
    yield put(updateFunds([]));
  }

  yield put(finishFetchingData(ActionType.GET_FUNDS_LIST));
}

export default function * fundInfoSaga() {
  yield takeLatest(ActionType.GET_FUNDS_LIST, getFundsList);
}