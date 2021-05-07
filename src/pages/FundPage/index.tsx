import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { DetailsTableView, FundBreadcrumbs, OptionsTableView } from '@components';
import { Page } from '@layouts';
import { OptionsEntry } from '@models';
import { State } from '@reduxConfig';

import './styles.scss';

interface PageProps {
    className?: string;
}

export const FundPage: FunctionComponent<PageProps> = (props) => {
    /* Route parameters */
    const params = useParams();
    const fundId = Number(params['id']);

    /* Redux parameters */
    const fundListEntries = useSelector<State, OptionsEntry[]>(state => state.fundInfo.fundList) || [];
    const entryArray = fundId !== undefined && fundId < fundListEntries.length ? [fundListEntries[fundId]] : [];

    return (
        <Page className='fund-page-wrapper'>
            <FundBreadcrumbs className='fund-page-breadcrumbs' fundId={fundId} />
            <OptionsTableView className='selected-option-entry-table' entries={entryArray} detailMode />
            <DetailsTableView optionEntry={entryArray.length > 0 ? entryArray[0] : undefined} />
        </Page>
    );
}
