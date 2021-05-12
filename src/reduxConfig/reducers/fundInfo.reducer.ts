import { ActionType, Action } from '../actions';
import { initialState } from '../state';
import { FundInfo } from '@models';

const initialFundInfo = Object.assign({}, initialState.fundInfo);

const fundsInfoReducer = (fundsInfo = initialFundInfo, action: Action): FundInfo => {
  switch (action.type) {
    case ActionType.UPDATE_FUNDS_LIST:
    case ActionType.UPDATE_FLAGGED_FUNDS:
    case ActionType.UPDATE_TOKEN_PRICES:
      return {...fundsInfo, ...action.payload};
    default:
      return fundsInfo;
  }
};

export default fundsInfoReducer;
