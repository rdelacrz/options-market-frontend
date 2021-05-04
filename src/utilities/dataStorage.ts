/**
 * Contains localStorage store and sync state logic.
 */

import { createStoreon, StoreonModule } from 'storeon';
import { persistState } from '@storeon/localstorage';
import { initialState, State } from '@reduxConfig';

const appDataKey = 'OPTIONS_MARKET_APP_DATA';

const appData: StoreonModule<State> = store => {
  store.on('@init', () => ({...initialState}));
  store.on('saveState', (state, updatedState: State) => updatedState);
}

export const dataStorage = createStoreon([
  appData,
  persistState(undefined, {key: appDataKey}),
]);
