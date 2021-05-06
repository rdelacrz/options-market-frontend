import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';

import './styles.scss';

interface FundBreadcrumbsProps {
    className?: string;
    fundId?: number;
}

export const FundBreadcrumbs: FunctionComponent<FundBreadcrumbsProps> = (props) => {
    return (
        <div className={classnames('fund-breadcrumbs-wrapper', {[props.className]: !!props.className})}>
            
            {props.fundId !== undefined ? (
                <React.Fragment>
                    <Link className='fund-breadcrumb-header link' to='/'>Funds</Link>
                    &#62;&nbsp;
                    <div className='fund-number-text'>Fund #{props.fundId}</div>
                </React.Fragment>
            ) : (
                <h1 className='fund-breadcrumb-header'>Funds</h1>
            )}
        </div>
    )
}