import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { Header, Footer } from '@components';
import { configureStore, history } from '@reduxConfig';
import RouterView from '@routes';

import './App.scss';

const store = configureStore();

function App() {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Header />
        <RouterView />
        <Footer />
      </ConnectedRouter>
    </Provider>
  );
}

export default App;
