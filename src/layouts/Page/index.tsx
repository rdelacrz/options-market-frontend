import React, { FunctionComponent } from 'react';
import { Main, Root, RootPortal } from '@aragon/ui';
import classnames from 'classnames';
import { Header, Footer, TopBar } from '@components';

import './style.scss';

interface PageProps {
    className?: string;
}

export const Page: FunctionComponent<PageProps> = (props) => {
    return (
        <div className={classnames('page-wrapper app-container', { [props.className]: !!props.className })}>
            <TopBar />
            <Header />
            <main className={classnames('page-main-content-wrapper', { [props.className]: !!props.className })}>
                {props.children}
            </main>
            <Footer />
        </div>
    );
}
