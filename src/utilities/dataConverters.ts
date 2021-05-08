/**
 * Contains functions that convert blockchain data into usable client-side models for the application.
 */

import { MarketData, OptionsEntry } from '@models';

export const convertMarketDataToFundList = (marketData: MarketData) => {
  const optionsData = marketData.data.markets.map<OptionsEntry>(m => ({
    id: m.id,
    type: 'call', // need to figure out where option type is coming from
    pair: m.paymentToken.symbol + '/' + m.collateralToken.symbol,
    price: Number(m.priceRatio),  // not sure
    strike: 0, // not sure
    expiration: m.expirationDate,
    premium: 0, // not sure
    lp: '0',  // not sure
    share: 0, // not sure
    bop: '0', // not sure
    wop: '0', // not sure
    status: 'open',
    feature: '',  // not sure
    openInterest: 0,  // not sure
    breakEven: 0, // not sure
    delta: 0, // not sure
    gamma: 0, // not sure
    theta: 0, // not sure
    vega: 0, // not sure
    tvl: 0, // not sure
    apy: 0, // not sure
  }));
  return optionsData;
}