/**
 * Model for market data acquired via GraphQL request.
 */

export interface MarketData {
  data: {
    markets: Market[],
  }
}

export interface Market {
  amm: {
    id: string,
  }
  bToken: {
    decimals: number,
    id: string,
    totalSupply: string,
  },
  claimFeeBasisPoints: number,
  closeFeeBasisPoints: number,
  collateralToken: {
    decimals: number,
    id: string,
    name: string,
    symbol: string,
  },
  createdBlock: string,
  createdTimestamp: string,
  createdTransaction: string,
  exerciseFeeBasisPoints: number,
  expirationDate: string,
  id: string,
  marketIndex: string,
  marketName: string,
  marketStyle: string,
  paymentToken: {
    decimals: number,
    id: string,
    name: string,
    symbol: string
  },
  priceRatio: string,
  wToken: {
    decimals: number,
    id: string,
    totalSupply: string,
  }
}
