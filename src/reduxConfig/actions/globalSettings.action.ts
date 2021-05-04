import { ActionType, Action } from './actionTypes';

/**
 * Adds the given action type name to the list of currently pending data fetches.
 * 
 * @param startedActionName Type of started Redux action.
 * @returns 
 */
export const startFetchingData = (startedActionType: string): Action => ({
  type: ActionType.START_FETCHING_DATA,
  payload: startedActionType,
});

export const finishFetchingData = (finishedActionType: string): Action => ({
  type: ActionType.FINISH_FETCHING_DATA,
  payload: finishedActionType,
});

export const clearDataFetches = (): Action => ({
  type: ActionType.CLEAR_DATA_FETCHES,
  payload: {pendingDataFetches: []},
});