/**
 * Encapsulates data related to an option.
 */

import { TokenData } from './tokenData';

export interface OptionsEntry {
  id: string;
  type: 'call' | 'put';
  pair: string;
  price: number;
  strike: number;
  expiration: Date;
  premium: number;
  lp: string;
  share: number;
  bop: TokenData;
  wop: TokenData;
  status: 'open' | 'closed';

  paymentToken: TokenData,
  collateralToken: TokenData,

  // Properties to be shown in after clicking details
  openInterest: number;
  breakEven: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  tvl: number;
  apy: number;
}
