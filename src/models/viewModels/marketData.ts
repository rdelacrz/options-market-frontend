/**
 * Model for market data acquired via GraphQL request.
 */

import { TokenData } from './tokenData';

export interface MarketData {
  data: {
    markets: Market[],
  }
}

export interface Market {
  amm: {
    id: string,
  }
  bToken: TokenData,
  claimFeeBasisPoints: number,
  closeFeeBasisPoints: number,
  collateralToken: TokenData,
  createdBlock: string,
  createdTimestamp: string,
  createdTransaction: string,
  exerciseFeeBasisPoints: number,
  expirationDate: string,
  id: string,
  marketIndex: string,
  marketName: string,
  marketStyle: string,
  paymentToken: TokenData,
  priceRatio: string,
  wToken: TokenData,
}
