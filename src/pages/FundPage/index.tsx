import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { DetailsTableView, FundBreadcrumbs, OptionsTableView } from '@components';
import { Page } from '@layouts';
import { OptionsEntry } from '@models';
import { State } from '@reduxConfig';
import { useFundList } from '@utilities';

import './styles.scss';

interface PageProps {
    className?: string;
}

export const FundPage: FunctionComponent<PageProps> = (props) => {
    /* Route parameters */
    const params = useParams();
    const fundId = Number(params['id']);

    /* Hook for acquiring fund list using Redux parameters */
    const { baseFundList, fundList } = useFundList();
    const baseEntryArray = fundId !== undefined && fundId < baseFundList.length ? [baseFundList[fundId]] : [];
    const entryArray = fundId !== undefined && fundId < fundList.length ? [fundList[fundId]] : [];

    return (
        <Page className='fund-page-wrapper'>
            <FundBreadcrumbs className='fund-page-breadcrumbs' fundId={fundId} />
            <OptionsTableView className='selected-option-entry-table' entries={baseEntryArray} entryExtensions={entryArray} detailMode />
            <DetailsTableView optionEntry={entryArray.length > 0 ? entryArray[0] : undefined} />
        </Page>
    );
}
