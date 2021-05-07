import { OptionsEntry } from '@models';
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
   payload: {fundList},
});
