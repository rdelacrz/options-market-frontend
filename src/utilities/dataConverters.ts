/**
 * Contains functions that convert blockchain data into usable client-side models for the application.
 */

import { MarketData, OptionsEntry } from '@models';
import dayjs from 'dayjs';
import { getAmmContractData } from './sirenUtilities';

export async function convertMarketDataToFundList(marketData: MarketData) {
  const optionsData: OptionsEntry[] = [];
  for (let m of marketData.data.markets) {
    const expiration = dayjs(Number(m.expirationDate) * 1000, {
      utc: true,
    }).toDate();
    
    const state: 'open' | 'expired' | 'closed' = dayjs(expiration).isAfter(
      dayjs(),
    )
      ? 'open'
      : dayjs(expiration).add(180, 'day').isAfter(dayjs())
      ? 'expired'
      : 'closed';

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
        expiration: expiration.toUTCString(),   // Store as string, not Date, or errors may occur on page refresh
        premium: 0,
        lp: '0',  // not sure
        share: 0, // not sure
        bop: m.bToken,
        wop: m.wToken,
        status: state,
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