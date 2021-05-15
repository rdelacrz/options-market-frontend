/**
 * Contains functions that convert blockchain data into usable client-side models for the application.
 */

import { BigNumber } from 'bignumber.js';
import dayjs from 'dayjs';
import Greeks from 'greeks';
import { AmmData, Market, OptionsEntry } from '@models';

export const getFundDataFromMarketData = (market: Market) => {
  const expiration = dayjs(Number(market.expirationDate) * 1000, {
    utc: true,
  }).toDate();
  
  const state = dayjs(expiration).isAfter(dayjs())
    ? 'open'
    : dayjs(expiration).add(180, 'day').isAfter(dayjs())
      ? 'expired' : 'closed';
  
  const marketNameComponents = market.marketName.split('.');
  const optionType = marketNameComponents[3];

  // Orders pair depending on option type
  const pair = optionType === 'P' ?
    market.paymentToken.symbol + '/' + market.collateralToken.symbol :
    market.collateralToken.symbol + '/' + market.paymentToken.symbol;
  
  const strike = Number(marketNameComponents[4]);
  
  const collateralTokenDecimals = market.collateralToken?.decimals || 18;
  const openInterest = new BigNumber(market.bToken?.totalSupply || 0)
    .shiftedBy(-collateralTokenDecimals)
    .dividedBy(optionType === 'C' ? 1 : strike)
    .decimalPlaces(4)
    .toNumber();

  const fundData: OptionsEntry = {
    id: market.id,
    type: optionType === 'C' ? 'call' : 'put',
    pair,
    price: undefined,
    strike: strike,
    expiration: expiration.toUTCString(),   // Store as string, not Date, or errors may occur on page refresh
    premium: 0,
    lp: '0',  // not sure
    share: 0, // not sure
    bop: market.bToken,
    wop: market.wToken,
    status: state,
    paymentToken: market.paymentToken,
    collateralToken: market.collateralToken,
    paymentPerCollateral: 0,
    openInterest,
    breakEven: '0',
    delta: 0,
    gamma: 0,
    theta: 0,
    vega: 0,
    rho: 0,
    tvl: 0,
    apy: 0,
  };

  return fundData;
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