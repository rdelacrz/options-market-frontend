import { BigNumber } from 'bignumber.js';
import { MinterAmmFactory } from '@sirenprotocol/sdk';
import { AmmData, Market } from '@models';
import { provider } from './providers';

export async function getAmmContractData(market: Market) {
  const marketSplit = market.marketName.split('.');
  const marketType = marketSplit[3].toUpperCase() === 'C' ? 'Call' : 'Put';
  const strike = marketSplit[4][0] === '0'
    ? Number(`0.${marketSplit[4].substring(1)}`)
    : Number(marketSplit[4]);

  try {
    const ammContract = MinterAmmFactory.connect(market.amm.id, provider);
    const price = await ammContract.getPriceForMarket(market.id);
    const exchange = await ammContract.getCurrentCollateralPrice();
    
    const volatilityFactor = await ammContract.volatilityFactor();
    const annualizedVolatilityFactor = new BigNumber(volatilityFactor.toString())
      .multipliedBy(new BigNumber(365 * 24 * 60 * 60).sqrt())
      .div(0.4)
      .shiftedBy(-18);

    const collateralTokenDecimals = market.collateralToken?.decimals || 18;
    const paymentTokenDecimals = market.paymentToken?.decimals || 18;
    const exchangeScaled = new BigNumber(exchange.toString()).shiftedBy(
      collateralTokenDecimals - paymentTokenDecimals - 18,
    );

    const result = marketType === 'Call'
      ? new BigNumber(price.toString())
        .shiftedBy(-18)
        .decimalPlaces(4)
        .toNumber()
      : new BigNumber(price.toString())
        .shiftedBy(-18)
        .multipliedBy(strike)
        .multipliedBy(exchangeScaled)
        .decimalPlaces(4)
        .toNumber();

    return {
      premium: result,
      exchange: exchangeScaled.toNumber(),
      annualizedVolatilityFactor: annualizedVolatilityFactor.toNumber(),
    } as AmmData;
  } catch (error) {
    return { premium: 0, exchange: 0 } as AmmData;
  }
}
