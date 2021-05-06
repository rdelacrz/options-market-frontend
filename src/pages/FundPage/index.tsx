import React, { FunctionComponent } from 'react';
import { Page } from '@layouts';

import './styles.scss';

interface PageProps {
    className?: string;
}

export const FundPage: FunctionComponent<PageProps> = (props) => {

    return (
        <Page className='fund-page-wrapper'>
            Fund Page
        </Page>
    );
}
