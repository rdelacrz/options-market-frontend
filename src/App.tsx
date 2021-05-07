import React, { FunctionComponent } from 'react';
import { Main } from '@aragon/ui';
import { ConnectedRouter } from 'connected-react-router';
import { providers } from 'ethers'
import { Provider } from 'react-redux';
import { Web3ReactProvider } from '@web3-react/core';
import { configureStore, history } from '@reduxConfig';
import RouterView from '@routes';

import './App.scss';

const store = configureStore();

const getLibrary = (provider: any, connector: any) => {
    return new providers.Web3Provider(provider);
}

const App: FunctionComponent<{}> = () => {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <Main layout={false}>
                        <RouterView />
                    </Main>
                </ConnectedRouter>
            </Provider>
        </Web3ReactProvider>
    );
}

export default App;
