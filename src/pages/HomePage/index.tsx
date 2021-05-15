import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FundBreadcrumbs, OptionsTableView } from '@components';
import { Page } from '@layouts';
import { getRawMarketData, State } from '@reduxConfig';
import { useFundList } from '@utilities';

import './styles.scss';

interface PageProps {
    className?: string;
}

export const HomePage: FunctionComponent<PageProps> = (props) => {
    const dataLoading = useSelector<State, boolean>(state => state.globalSettings.pendingDataFetches.length > 0);
    const dispatch = useDispatch();

    // Gets raw market data 
    useEffect(() => {
        dispatch(getRawMarketData());
    }, [dispatch]);

    // Hook for acquiring fund list using Redux parameters
    const fundListEntries = useFundList();

    return (
        <Page className='home-page-wrapper'>
            <FundBreadcrumbs className='home-page-breadcrumbs' />
            <OptionsTableView entries={fundListEntries} loading={dataLoading} />
        </Page>
    );
}
