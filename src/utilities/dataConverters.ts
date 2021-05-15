/**
 * Contains functions that convert blockchain data into usable client-side models for the application.
 */

import { BigNumber } from 'bignumber.js';
import dayjs from 'dayjs';
import Greeks from 'greeks';
import { AmmData, MarketData, OptionsEntry } from '@models';

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

export const getGreeks = (optionsEntry: OptionsEntry, ammData: AmmData) => {
  const marketType = optionsEntry.type;
  const strike = optionsEntry.strike;

  const expiration = new Date(optionsEntry.expiration);
  const yearsToExpiration = dayjs(expiration).diff(dayjs(), 'year', true);

  const exchange = ammData.exchange;
  const annualizedVolatilityFactor = ammData.annualizedVolatilityFactor;

  const greeksValues = {
    delta: new BigNumber(
      Greeks.getDelta(
        marketType === "call" ? exchange : 1 / exchange,
        strike,
        yearsToExpiration,
        annualizedVolatilityFactor,
        0,
        marketType.toLowerCase(),
      ),
    )
      .decimalPlaces(5)
      .toNumber(),
    gamma: new BigNumber(
      Greeks.getGamma(
        marketType === "call" ? exchange : 1 / exchange,
        strike,
        yearsToExpiration,
        annualizedVolatilityFactor,
        0,
      ),
    )
      .decimalPlaces(5)
      .toNumber(),
    vega: new BigNumber(
      Greeks.getVega(
        marketType === "call" ? exchange : 1 / exchange,
        strike,
        yearsToExpiration,
        annualizedVolatilityFactor,
        0,
      ),
    )
      .decimalPlaces(5)
      .toNumber(),
    theta: new BigNumber(
      Greeks.getTheta(
        marketType === "call" ? exchange : 1 / exchange,
        strike,
        yearsToExpiration,
        annualizedVolatilityFactor,
        0,
        marketType.toLowerCase(),
      ),
    )
      .decimalPlaces(5)
      .toNumber(),
    rho: new BigNumber(
      Greeks.getRho(
        marketType === "call" ? exchange : 1 / exchange,
        strike,
        yearsToExpiration,
        annualizedVolatilityFactor,
        0,
        marketType.toLowerCase(),
      ),
    )
      .decimalPlaces(5)
      .toNumber(),
  }
  return greeksValues;
}