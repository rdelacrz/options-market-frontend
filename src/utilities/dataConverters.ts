/**
 * Contains functions that convert blockchain data into usable client-side models for the application.
 */

import { MarketData, OptionsEntry, TokenData } from '@models';

const convertSecondsSinceEpochToDate = (seconds: string | number) => {
  const milliseconds = Number(seconds) * 1000;   // Must convert to milliseconds for Date class
  return new Date(Number(milliseconds));
}

export async function convertMarketDataToFundList(marketData: MarketData) {
  const tokenPrices: { [id: string]: string } = {};

  const optionsData: OptionsEntry[] = [];
  for (let m of marketData.data.markets) {
    const expiration = convertSecondsSinceEpochToDate(m.expirationDate);

    // Only adds unexpired funds to the list
    if (expiration.getTime() >= new Date().getTime()) {
      const marketNameComponents = m.marketName.split('.');
      const optionType = marketNameComponents[3];

      // Orders pair depending on option type
      const pair = optionType === 'P' ?
        m.paymentToken.symbol + '/' + m.collateralToken.symbol :
        m.collateralToken.symbol + '/' + m.paymentToken.symbol;

      optionsData.push({
        id: m.id,
        type: optionType === 'C' ? 'call' : 'put',
        pair,
        price: undefined,
        strike: Number(marketNameComponents[4]),
        expiration,
        premium: 0, // not sure
        lp: '0',  // not sure
        share: 0, // not sure
        bop: m.bToken,
        wop: m.wToken,
        status: 'open',
        paymentToken: m.paymentToken,
        collateralToken: m.collateralToken,
        openInterest: 0,  // not sure
        breakEven: 0, // not sure
        delta: 0, // not sure
        gamma: 0, // not sure
        theta: 0, // not sure
        vega: 0, // not sure
        tvl: 0, // not sure
        apy: 0, // not sure
      });
    }
  }
  return optionsData;
}