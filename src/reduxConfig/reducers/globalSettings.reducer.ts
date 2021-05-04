import { ActionType, Action, initialState } from '@reduxConfig';
import { GlobalSettings } from '@models';

const globalSettingsReducer = (globalSettings = initialState.globalSettings, action: Action): GlobalSettings => {
  let pendingDataFetches: string[];
  switch (action.type) {
    case ActionType.CLEAR_DATA_FETCHES:
      return {...globalSettings, ...action.payload};
    case ActionType.FINISH_FETCHING_DATA:
      const finishedActionType = action.payload as string;
      pendingDataFetches = globalSettings.pendingDataFetches.filter(f => f !== finishedActionType);
      return {...globalSettings, pendingDataFetches};
    case ActionType.START_FETCHING_DATA:
      const startedActionType = action.payload as string;
      pendingDataFetches = globalSettings.pendingDataFetches.slice();
      if (pendingDataFetches.indexOf(startedActionType) === -1) {
        pendingDataFetches.push(startedActionType);
      }
      return {...globalSettings, pendingDataFetches};
    default:
      return globalSettings;
  }
};

export default globalSettingsReducer;
