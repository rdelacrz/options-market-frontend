import { AxiosResponse } from 'axios';
import { call, fork, takeLatest, put, select } from 'redux-saga/effects';
import { AmmData, Market, MarketData, TokenData } from '@models';
import { getMarkets, getUSDPrice } from '@services';
import { getAmmContractData } from '@utilities';
import {
  Action, ActionType, startFetchingData, finishFetchingData, updateAmmDataMap, updateRawMarketData
} from '../actions';
import { State } from '../state';

/**
 * Gets AMM data for given market item. This function is a helper function for getFundsList, meant to be 
 * forked so that multiple API calls can be made concurrently without blocking execution.
 */
function* getAMMDataList(market: Market) {
  const ammdata: AmmData = yield call(() => getAmmContractData(market));
  const ammDataMap: { [id: string]: AmmData } = yield select((state: State) => state.fundInfo.ammDataMap);
  yield put(updateAmmDataMap({...ammDataMap, [market.id]: ammdata}));
}

/**
 * Gets list of raw market data for performing CALL and PUT options.
 */
function* getRawMarketData() {
  yield put(startFetchingData(ActionType.GET_RAW_MARKET_DATA));

  const marketData: AxiosResponse<MarketData> = yield call(getMarkets);
  yield put(updateRawMarketData(marketData.data.data.markets));

  // Gets AMM data using retrieved market data
  for (let market of marketData.data.data.markets) {
    yield fork(getAMMDataList, market);
  }

  yield put(finishFetchingData(ActionType.GET_RAW_MARKET_DATA));
}

export default function * fundInfoSaga() {
  yield takeLatest(ActionType.GET_RAW_MARKET_DATA, getRawMarketData);
}