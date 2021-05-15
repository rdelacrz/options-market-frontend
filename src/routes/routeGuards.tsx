/**
 * Any route guards needed to protect certain routes from illegal access are implemented here. They are supposed to redirect
 * the user if a route is illegally accessed.
 */

import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router';
import { OptionsEntry } from '@models';
import { State } from '@reduxConfig';

/**
 * Checks whether fund id in parameters is valid and that the list of fund list entries do exist, otherwise the user
 * is redirected back to the home page.
 * 
 * @param props Standard component props whose children contain the actual page component content.
 * @returns Fund page route guard.
 */
export const FundGuard: FunctionComponent<{}> = (props) => {
    /* Route parameters */
    const params = useParams();
    const fundId = Number(params['id']);

    /* Redux parameters */
    const fundListEntries = useSelector<State, OptionsEntry[]>(state => state.fundInfo.fundList) || [];

    return (
        <React.Fragment>
            {Number.isInteger(fundId) && fundId < fundListEntries.length ?
                props.children :
                <Redirect to='/' />}
        </React.Fragment>
    );
}