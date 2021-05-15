import { AmmData, Market, TokenData } from '@models';
import { ActionType, Action } from './actionTypes';

/**
 * Gets list of raw market data from Ethereum contract.
 * 
 * @returns Action for triggering the async getter action for the list of raw market data.
 */
export const getRawMarketData = (): Action => ({
  type: ActionType.GET_RAW_MARKET_DATA,
});

/**
 * Updates list of raw market data.
 * 
 * @returns Action with list of raw market data as payload for reducer.
 */
 export const updateRawMarketData = (markets: Market[]): Action => ({
   type: ActionType.UPDATE_RAW_MARKET_DATA,
   payload: { markets },
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
