import React, { FunctionComponent } from 'react';
import { Redirect } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { VaultPage } from '@pages';

const Routes: FunctionComponent<{}> = () => (
  <>
    <Switch>
      <Route exact path='/'>
        <VaultPage />
      </Route>
      <Route exact path='/options-market-frontend'>
        <Redirect to='/' />
      </Route>
    </Switch>
  </>
)

export default Routes;