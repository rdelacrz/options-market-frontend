import React, { FunctionComponent } from 'react';
import { Redirect } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { FundPage, HomePage } from '@pages';
import { FundGuard } from './routeGuards';

const Routes: FunctionComponent<{}> = () => (
    <Switch>
        <Route exact path='/'>
            <HomePage />
        </Route>

        <Route exact path='/funds/:id'>
            <FundGuard>
                <FundPage />
            </FundGuard>
        </Route>

        <Route exact path='/options-market-frontend'>
            <Redirect to='/' />
        </Route>
    </Switch>
)

export default Routes;