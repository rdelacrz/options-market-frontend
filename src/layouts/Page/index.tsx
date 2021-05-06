import React, { FunctionComponent } from 'react';
import { Main } from '@aragon/ui';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { Header, Footer, TopBar } from '@components';
import { State } from '@reduxConfig';
import { useScrollPosition } from '@n8tb1t/use-scroll-position';

import './style.scss';

interface PageProps {
    className?: string;
}

export const Page: FunctionComponent<PageProps> = (props) => {
    /* Redux variables */
    const pageLoading = useSelector<State, string[]>(state => state.globalSettings.pendingDataFetches).length > 0;

    return (
        <div className={classnames('page-wrapper', { [props.className]: !!props.className })}>
            <TopBar />
            <Header />
            <main className={classnames('page-main-content-wrapper', { [props.className]: !!props.className })}>
                {pageLoading ? <div className='loading-icon' /> : props.children}
            </main>
            <Footer />
        </div>
    );
}
