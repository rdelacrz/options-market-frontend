import { AmmData, OptionsEntry, TokenData } from '@models';
import { ActionType, Action } from './actionTypes';

/**
 * Gets list of funds from Ethereum contract.
 * 
 * @returns Action for triggering the async getter action for the list of funds.
 */
export const getFunds = (): Action => ({
  type: ActionType.GET_FUNDS_LIST,
});

/**
 * Updates list of funds.
 * 
 * @returns Action with cleared list of funds as payload for reducer.
 */
 export const updateFunds = (fundList: OptionsEntry[]): Action => ({
   type: ActionType.UPDATE_FUNDS_LIST,
   payload: { fundList },
});

/**
 * Gets AMM data from AMM contract.
 * 
 * @returns Action for triggering the async getter action for the AMM data.
 */
 export const getAMMDataMap = (): Action => ({
  type: ActionType.GET_AMM_DATA_MAP,
});

/**
 * Updates AMM data points.
 * 
 * @returns Action with data dictionary of AMM data as payload for reducer.
 */
export const updateAmmDataMap = (ammDataMap: {[id: string]: AmmData}): Action => ({
  type: ActionType.UPDATE_AMM_DATA_MAP,
  payload: { ammDataMap },
});

/**
 * Updates data dictionary of flagged funds.
 * 
 * @returns Action with updated data dictionary of flagged funds as payload for reducer.
 */
export const updateFlaggedFunds = (flaggedFunds: {[id: string]: boolean}): Action => ({
  type: ActionType.UPDATE_FLAGGED_FUNDS,
  payload: { flaggedFunds },
});

/**
 * Gets token prices from Uniswap API.
 * 
 * @returns Action for triggering the async getter action for the data dictionary of token prices.
 */
 export const getTokenPrices = (tokenList: TokenData[]): Action => ({
  type: ActionType.GET_TOKEN_PRICES,
  payload: tokenList,
});

/**
 * Updates data dictionary of token prices.
 * 
 * @returns Action with updated data dictionary of token prices as payload for reducer.
 */
 export const updateTokenPrices = (tokenPrices: { [id: string]: number }): Action => ({
  type: ActionType.UPDATE_TOKEN_PRICES,
  payload: { tokenPrices },
});
