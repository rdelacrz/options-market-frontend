import { Action as BaseAction } from 'redux';

export enum ActionType {
  // Global settings actions
  START_FETCHING_DATA = 'START_FETCHING_DATA',
  FINISH_FETCHING_DATA = 'FINISH_FETCHING_DATA',
  CLEAR_DATA_FETCHES = 'CLEAR_DATA_FETCHES',

  // Funds info actions
  GET_FUNDS_LIST = 'GET_FUNDS_LIST',
  UPDATE_FUNDS_LIST = 'UPDATE_FUNDS_LIST',
  UPDATE_FLAGGED_FUNDS = 'UPDATE_FLAGGED_FUNDS',
}

export interface Action extends BaseAction {
  type: ActionType;
  payload?: any;      // Used for reducers and most sagas
  sagaParam?: any;    // Additional parameter used for sagas if affecting redux state is undesirable
}
