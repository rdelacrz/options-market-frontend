/**
 * Contains fund related information to be displayed on the website.
 */

import { OptionsEntry } from '@models';

export interface FundInfo {
  fundList: OptionsEntry[];
  flaggedFunds: { [id: string]: boolean };    // Flags funds based on fund id
}
