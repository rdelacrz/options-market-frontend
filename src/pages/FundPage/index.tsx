import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router';
import { FundBreadcrumbs, OptionsTableView } from '@components';
import { Page } from '@layouts';
import { OptionsEntry } from '@models';

import './styles.scss';

interface PageProps {
    className?: string;
}

export const FundPage: FunctionComponent<PageProps> = (props) => {
    const params = useParams();
    const fundId = Number(params['id']);

    // TO IMPLEMENT: REPLACE WITH ACTUAL DATA ONCE LINK TO ETH NETWORK IS COMPLETE
    const entries: OptionsEntry[] = [
        {
            type: 'call', pair: 'WBTC-USDC', price: 60000, strike: 80000, expiration: new Date(), premium: 0.0592,
            lp: null, share: 0, bop: null, wop: null, status: 'open', feature: null
        },
        {
            type: 'put', pair: 'WBTC-ETH', price: 60000, strike: 80000, expiration: new Date(), premium: 0.0592,
            lp: null, share: 0, bop: null, wop: null, status: 'open', feature: null
        }
    ]
    const entry = entries[fundId];

    return (
        <Page className='fund-page-wrapper'>
            <FundBreadcrumbs className='fund-page-breadcrumbs' fundId={fundId} />
            <OptionsTableView entries={[entry]} />
        </Page>
    );
}
