import React, { FunctionComponent, useCallback } from 'react';
import { ContextMenu, ContextMenuItem, DataView } from '@aragon/ui';
import classnames from 'classnames';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { OptionsEntry } from '@models';
import { useWindowSize } from '@utilities';
import { format } from 'date-fns';

import './styles.scss';

const OPTIONS_FIELDS = [
    'Type', 'Pair', 'Price', 'STRIKE', 'Expiration', 'Premium', 'LP', 'Share%',
    'BOP', 'WOP', 'Status', 'Feature (blank)', 'Dropdown (blank)'
];

interface OptionsTableViewProps {
    className?: string;
    entries: OptionsEntry[];
    loading?: boolean;
    detailMode?: boolean;
}

export const OptionsTableView: FunctionComponent<OptionsTableViewProps> = (props) => {
    const dispatch = useDispatch();

    const { width } = useWindowSize();
    const mode = width > 900 ? 'table' : 'list';

    /**
     * Navigates to the fund page associated with the selected entry.
     */
    const handleDetailsClick = useCallback((fundId: number) => {
        dispatch(push(`/funds/${fundId}`));
    }, [location.pathname]); 

    return (
        <div className={classnames('options-table-view-wrapper', mode, {[props.className]: !!props.className})}>
            <DataView
                mode={mode} status={props.loading ? 'loading' : 'default'}
                fields={OPTIONS_FIELDS}
                entries={props.loading ? [] : props.entries}
                renderEntry={(optionsEntry: OptionsEntry, index: number) => {
                    const utcDate = new Date(Number(optionsEntry.expiration));
                    return [
                        <div className={classnames('option-type', optionsEntry.type)}>
                            {optionsEntry.type.toUpperCase()}
                        </div>,
                        <Link className='options-pair-link' to={`/funds/${index}`}>
                            {optionsEntry.pair}
                        </Link>,
                        optionsEntry.price,
                        optionsEntry.strike,
                        <div className='expiration-container'>
                            <div className='date-text'>{format(utcDate, 'dd/MM/yyyy')}</div>
                            <div className='time-zone'>{format(utcDate, 'hh:mm')} UTC</div>
                        </div>,
                        optionsEntry.premium,
                        optionsEntry.lp,
                        optionsEntry.share,
                        optionsEntry.bop,
                        optionsEntry.wop,
                        optionsEntry.status,
                        optionsEntry.feature,
                        <ContextMenu>
                            <ContextMenuItem>Provide</ContextMenuItem>
                            <ContextMenuItem>Withdraw</ContextMenuItem>
                            <ContextMenuItem>Buy</ContextMenuItem>
                            <ContextMenuItem>Exercise</ContextMenuItem>
                            <ContextMenuItem>Sell</ContextMenuItem>
                            {!props.detailMode && (
                                <ContextMenuItem onClick={() => handleDetailsClick(index)}>Details</ContextMenuItem>
                            )}
                        </ContextMenu>
                    ]
                }}
            />
        </div>
    )
}
