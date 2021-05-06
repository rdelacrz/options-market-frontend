/**
 * Encapsulates information related to an option within the OptionsTableView component.
 */
export interface OptionsEntry {
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
  feature: string;
}