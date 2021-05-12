import { AxiosResponse } from 'axios';
import { call, fork, takeLatest, put, select } from 'redux-saga/effects';
import environment from '@environment';
import { MarketData, OptionsEntry, TokenData } from '@models';
import { getMockFundList, getMarkets, getUSDPrice } from '@services';
import { convertMarketDataToFundList } from '@utilities';
import { Action, ActionType, startFetchingData, finishFetchingData, updateFunds, updateTokenPrices } from '../actions';
import { State } from '../state';

/**
 * Gets list of funds for performing CALL and PUT options.
 */
function* getFundsList() {
  yield put(startFetchingData(ActionType.GET_FUNDS_LIST));

  // Mock data was set up early in development process for testing basic fund list getter
  if (environment.useMockData) {
    const mockFundList = yield call(getMockFundList);
    yield put(updateFunds(mockFundList));
  } else {
    const marketData: AxiosResponse<MarketData> = yield call(getMarkets);
    const fundList: OptionsEntry[] = yield call(() => convertMarketDataToFundList(marketData.data));
    yield put(updateFunds(fundList));
  }

  yield put(finishFetchingData(ActionType.GET_FUNDS_LIST));
}

function* storeTokenPrice(tokenData: TokenData) {
  const tokenPrice: number = yield call(() => getUSDPrice(tokenData));
  const tokenPrices: {[id: string]: number} = yield select((state: State) => state.fundInfo.tokenPrices);
  yield put(updateTokenPrices({...tokenPrices, [tokenData.symbol]: tokenPrice}));
}

/**
 * Gets prices associated with passed tokens and stores them in the Redux store.
 * 
 * @param action - Action containing the payload for the token data being retrieved.
 */
function* getTokenPrices(action: Action) {
  const tokenList = action.payload as TokenData[];
  for (let tokenData of tokenList) {
    yield fork(storeTokenPrice, tokenData);
  }
}

export default function * fundInfoSaga() {
  yield takeLatest(ActionType.GET_FUNDS_LIST, getFundsList);
  yield takeLatest(ActionType.GET_TOKEN_PRICES, getTokenPrices);
}