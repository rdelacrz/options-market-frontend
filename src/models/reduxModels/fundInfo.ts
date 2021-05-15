/**
 * Contains fund related information to be displayed on the website.
 */

import { AmmData, OptionsEntry } from '@models';

export interface FundInfo {
  fundList: OptionsEntry[];
  ammDataMap: { [id: string]: AmmData };
  flaggedFunds: { [id: string]: boolean };    // Flags funds based on fund id
  tokenPrices: { [id: string]: number };    // Maps token symbols to associated prices
}
