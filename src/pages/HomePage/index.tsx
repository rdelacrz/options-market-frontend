import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { OptionsTableView } from '@components';
import { Page } from '@layouts';

import './style.scss';

interface PageProps {
    className?: string;
}

export const HomePage: FunctionComponent<PageProps> = (props) => {

    return (
        <Page className='home-page-wrapper'>
            <OptionsTableView entries={[
                {
                    type: 'call', pair: 'WBTC-USDC', price: 60000, strike: 80000, expiration: new Date('03-26-2021'), premium: 0.0592,
                    lp: null, share: 0, bop: null, wop: null, status: 'open', feature: null, dropdown: null
                }
            ]} />
        </Page>
    );
}
