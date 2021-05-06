import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router';
import { FundBreadcrumbs, OptionsTableView } from '@components';
import { Page } from '@layouts';

import './styles.scss';

interface PageProps {
    className?: string;
}

export const FundPage: FunctionComponent<PageProps> = (props) => {
    const params = useParams();
    const fundId = Number(params['id']);
    return (
        <Page className='fund-page-wrapper'>
            <FundBreadcrumbs className='fund-page-breadcrumbs' fundId={fundId} />
            Fund Page
        </Page>
    );
}
