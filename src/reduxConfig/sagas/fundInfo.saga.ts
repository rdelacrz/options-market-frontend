import { AxiosResponse } from 'axios';
import { call, takeLatest, put, select } from 'redux-saga/effects';
import { ActionType, startFetchingData, finishFetchingData, updateFunds } from '../actions';
import environment from '@environment';
import { MarketData, OptionsEntry } from '@models';
import { getMockFundList, getMarkets } from '@services';
import { convertMarketDataToFundList } from '@utilities';

/**
 * Gets list of funds for performing CALL and PUT options.
 */
function* getFundsList() {
  yield put(startFetchingData(ActionType.GET_FUNDS_LIST));

  if (environment.useMockData) {
    const mockFundList = yield call(getMockFundList);
    yield put(updateFunds(mockFundList));
  } else {
    const marketData: AxiosResponse<MarketData> = yield call(getMarkets);
    const fundList = convertMarketDataToFundList(marketData.data);
    yield put(updateFunds(fundList));
  }

  yield put(finishFetchingData(ActionType.GET_FUNDS_LIST));
}

export default function * fundInfoSaga() {
  yield takeLatest(ActionType.GET_FUNDS_LIST, getFundsList);
}