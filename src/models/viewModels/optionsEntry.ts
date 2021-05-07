/**
 * Encapsulates data related to an option.
 */
export interface OptionsEntry {
  type: 'call' | 'put';
  pair: string;
  price: number;
  strike: number;
  expiration: string;
  premium: number;
  lp: string;
  share: number;
  bop: string;
  wop: string;
  status: 'open' | 'closed';
  feature: string;
}