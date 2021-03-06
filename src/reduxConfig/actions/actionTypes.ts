import { Action as BaseAction } from "redux";

export enum ActionType {
  // Global settings actions
  START_FETCHING_DATA = "START_FETCHING_DATA",
  FINISH_FETCHING_DATA = "FINISH_FETCHING_DATA",
  CLEAR_DATA_FETCHES = "CLEAR_DATA_FETCHES",
  UPDATE_COLOR_THEME = "UPDATE_COLOR_THEME",

  // Funds info actions
  GET_RAW_MARKET_DATA = "GET_RAW_MARKET_DATA",
  UPDATE_RAW_MARKET_DATA = "UPDATE_RAW_MARKET_DATA",
  GET_AMM_DATA_MAP = "GET_AMM_DATA_MAP",
  UPDATE_AMM_DATA_MAP = "UPDATE_AMM_DATA_MAP",
  UPDATE_FLAGGED_FUNDS = "UPDATE_FLAGGED_FUNDS",
  UPDATE_TOKEN_PRICES = "UPDATE_TOKEN_PRICES",
}

export interface Action extends BaseAction {
  type: ActionType;
  payload?: any; // Used for reducers and most sagas
  sagaParam?: any; // Additional parameter used for sagas if affecting redux state is undesirable
}
