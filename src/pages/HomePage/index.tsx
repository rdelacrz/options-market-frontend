import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FundBreadcrumbs, OptionsTableView } from '@components';
import { Page } from '@layouts';
import { OptionsEntry } from '@models';
import { getFunds, State } from '@reduxConfig';

import './styles.scss';

interface PageProps {
    className?: string;
}

export const HomePage: FunctionComponent<PageProps> = (props) => {
    const dataLoading = useSelector<State, boolean>(state => state.globalSettings.pendingDataFetches.length > 0);
    const fundListEntries = useSelector<State, OptionsEntry[]>(state => state.fundInfo.fundList) || [];
    const dispatch = useDispatch();

    // Gets funds 
    useEffect(() => {
        dispatch(getFunds());
    }, [dispatch]);

    return (
        <Page className='home-page-wrapper'>
            <FundBreadcrumbs className='home-page-breadcrumbs' />
            <OptionsTableView entries={fundListEntries} loading={dataLoading} />
        </Page>
    );
}
