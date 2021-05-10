/**
 * Encapsulates data related to an option.
 */
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
  bop: string;
  wop: string;
  status: 'open' | 'closed';

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
