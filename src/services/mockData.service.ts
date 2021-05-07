/**
 * Data here should only be used early in development phase when real data is not available.
 */

import { OptionsEntry } from '@models';

export function getMockFundList() {
  const mockFundList: OptionsEntry[] = [
    {
      type: 'call', pair: 'WBTC-USDC', price: 60000, strike: 80000, expiration: new Date().toUTCString(), premium: 0.0592,
      lp: null, share: 0, bop: null, wop: null, status: 'open', feature: null
    },
    {
      type: 'put', pair: 'WBTC-ETH', price: 50000, strike: 70000, expiration: new Date().toUTCString(), premium: 0.2592,
      lp: null, share: 0, bop: null, wop: null, status: 'open', feature: null
    },
  ];

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockFundList);
    }, 2000)
  });
}
