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
  expiration: string;
  premium: number;
  lp: string;
  share: number;
  bop: TokenData;
  wop: TokenData;
  status: 'open' | 'expired' | 'closed';
  paymentToken: TokenData,
  collateralToken: TokenData,
  paymentPerCollateral: number,

  // Properties to be shown in after clicking details
  openInterest: number;
  breakEven: string;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  tvl: number;
  apy: number;
}
