import React, { FunctionComponent } from 'react';
import { Redirect } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { FundPage, HomePage } from '@pages';

const Routes: FunctionComponent<{}> = () => (
    <Switch>
        <Route exact path='/'>
            <HomePage />
        </Route>
        <Route exact path='/funds/:id'>
            <FundPage />
        </Route>

        <Route exact path='/options-market-frontend'>
            <Redirect to='/' />
        </Route>
    </Switch>
)

export default Routes;