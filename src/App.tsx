import React, { FunctionComponent } from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { configureStore, history } from '@reduxConfig';
import RouterView from '@routes';

import './App.scss';

const store = configureStore();

const App: FunctionComponent<{}> = () => {
    return (
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <RouterView />
            </ConnectedRouter>
        </Provider>
    );
}

export default App;
