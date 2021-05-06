import React, { FunctionComponent } from 'react';
import { FundBreadcrumbs, OptionsTableView } from '@components';
import { Page } from '@layouts';

import './styles.scss';

interface PageProps {
    className?: string;
}

export const HomePage: FunctionComponent<PageProps> = (props) => {

    return (
        <Page className='home-page-wrapper'>
            <FundBreadcrumbs className='home-page-breadcrumbs' />
            <OptionsTableView entries={[
                {
                    type: 'call', pair: 'WBTC-USDC', price: 60000, strike: 80000, expiration: new Date(), premium: 0.0592,
                    lp: null, share: 0, bop: null, wop: null, status: 'open', feature: null
                },
                {
                    type: 'put', pair: 'WBTC-ETH', price: 60000, strike: 80000, expiration: new Date(), premium: 0.0592,
                    lp: null, share: 0, bop: null, wop: null, status: 'open', feature: null
                }
            ]} />
        </Page>
    );
}
