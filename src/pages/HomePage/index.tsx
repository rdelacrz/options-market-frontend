import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { Page } from '@layouts';
import { State } from '@reduxConfig';

import './style.scss';

interface PageProps {
    className?: string;
}

export const HomePage: FunctionComponent<PageProps> = (props) => {

    return (
        <Page className='home-page-wrapper'>
            Home Page Content
        </Page>
    );
}
