import React, { FunctionComponent, useCallback, useState } from 'react';
import { Main } from '@aragon/ui';
import classnames from 'classnames';
import { throttle } from 'lodash';
import { Header, Footer, TopBar } from '@components';

import './style.scss';

interface PageProps {
    className?: string;
    pageContentClassName?: string;
}

export const Page: FunctionComponent<PageProps> = (props) => {
    const [solidTopBar, setSolidTopBar] = useState(false);

    const updateSolidScrollBar = useCallback(throttle((solid) => {
        setSolidTopBar(solid);
    }, 50), []);

    const handleScroll = useCallback((event) => {
        updateSolidScrollBar(event.target.scrollTop > 0);
    }, [updateSolidScrollBar]);

    const pageWrapperClass = classnames('page-wrapper', { [props.className]: !!props.className });
    const pageContentClass = classnames('page-main-content-wrapper app-container', { [props.pageContentClassName]: !!props.pageContentClassName });

    return (
        <Main layout={false} scrollView={false}>
            <div className={pageWrapperClass} onScroll={handleScroll}>
                <TopBar solid={solidTopBar} />
                <Header />
                <main className={pageContentClass}>
                    {props.children}
                </main>
                <Footer />
            </div>
        </Main>
    );
}
