import React, { FunctionComponent, useCallback } from 'react';
import { ContextMenu, ContextMenuItem, DataView, IdentityBadge } from '@aragon/ui';
import classnames from 'classnames';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
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
        <div className={classnames('options-table-view-wrapper', mode)}>
            <DataView
                mode={mode}
                fields={OPTIONS_FIELDS}
                entries={props.entries}
                renderEntry={(optionsEntry: OptionsEntry, index: number) => {
                    return [
                        <IdentityBadge entity={optionsEntry.type.toUpperCase()} />,
                        optionsEntry.pair,
                        optionsEntry.price,
                        optionsEntry.strike,
                        <div className='expiration-container'>
                            <div className='date-text'>{format(optionsEntry.expiration, 'dd/MM/yyyy')}</div>
                            <div className='time-zone'>{format(optionsEntry.expiration, 'hh:mm')} UTC</div>
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
