import { AxiosResponse } from 'axios';
import { call, fork, takeLatest, put, select } from 'redux-saga/effects';
import { AmmData, Market, MarketData, TokenData } from '@models';
import { getMarkets, getUSDPrice } from '@services';
import { getAmmContractData } from '@utilities';
import {
  Action, ActionType, startFetchingData, finishFetchingData,
  updateAmmDataMap, updateRawMarketData, updateTokenPrices
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

/**
 * Gets price of a token in USD terms, then stores it in the Redux store. This function is a helper 
 * function for getTokenPrices, meant to be forked so that multiple API calls can be made concurrently without
 * blocking execution.
 * 
 * @param tokenData Blockchain data associated with a token, which will be used to obtain its price (in USD terms). 
 */
function* storeTokenPrice(tokenData: TokenData) {
  const tokenPrice: number = yield call(() => getUSDPrice(tokenData));
  const tokenPrices: {[id: string]: number} = yield select((state: State) => state.fundInfo.tokenPrices);
  yield put(updateTokenPrices({...tokenPrices, [tokenData.symbol]: tokenPrice}));
}

/**
 * Gets prices associated with passed tokens and stores them in the Redux store.
 * 
 * @param action Action containing the payload for the token data being retrieved.
 */
function* getTokenPrices(action: Action) {
  const tokenList = action.payload as TokenData[];
  for (let tokenData of tokenList) {
    yield fork(storeTokenPrice, tokenData);
  }
}

export default function * fundInfoSaga() {
  yield takeLatest(ActionType.GET_RAW_MARKET_DATA, getRawMarketData);
  yield takeLatest(ActionType.GET_TOKEN_PRICES, getTokenPrices);
}