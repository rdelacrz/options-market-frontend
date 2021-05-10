/**
 * Contains functions that convert blockchain data into usable client-side models for the application.
 */

import { MarketData, OptionsEntry } from '@models';

const convertSecondsSinceEpochToDate = (seconds: string | number) => {
  const milliseconds = Number(seconds) * 1000;   // Must convert to milliseconds for Date class
  return new Date(Number(milliseconds));
}

export const convertMarketDataToFundList = (marketData: MarketData) => {
  const optionsData = marketData.data.markets
    .map<OptionsEntry>(m => {
      const marketNameComponents = m.marketName.split('.');
      return {
        id: m.id,
        type: marketNameComponents[3] === 'C' ? 'call' : 'put',
        pair: m.paymentToken.symbol + '/' + m.collateralToken.symbol,
        price: Number(m.priceRatio),  // not sure
        strike: Number(marketNameComponents[4]),
        expiration: convertSecondsSinceEpochToDate(m.expirationDate),
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
      };
    })
    .filter(fund => fund.expiration.getTime() >= new Date().getTime())  // Filters out expired contracts
  return optionsData;
}