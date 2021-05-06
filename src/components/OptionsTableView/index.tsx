import React, { FunctionComponent, useRef, useState } from 'react';
import { ContextMenu, ContextMenuItem, DataView, IdentityBadge } from '@aragon/ui';
import classnames from 'classnames';
import { OptionsEntry } from '@models';
import { useWindowSize } from '@utilities';

import './styles.scss';

const OPTIONS_FIELDS = [
    'Type', 'Pair', 'Price', 'STRIKE', 'Expiration', 'Premium', 'LP', 'Share%',
    'BOP', 'WOP', 'Status', 'Feature (blank)', 'Dropdown (blank)'
];

const ACTION_DROPDOWN_OPTIONS = [
    'Provide', 'Withdraw', 'Buy', 'Exercise', 'Sell', 'Details'
];

interface OptionsTableViewProps {
    className?: string;
    entries: OptionsEntry[];
}

export const OptionsTableView: FunctionComponent<OptionsTableViewProps> = (props) => {
    const { width } = useWindowSize();
    const mode = width > 900 ? 'table' : 'list';
    return (
        <div>
            <DataView
                mode={mode}
                fields={OPTIONS_FIELDS}
                entries={props.entries}
                renderEntry={({ type, pair, price, strike, expiration, premium, lp, share, bop, wop, status, feature }: OptionsEntry) => {
                    return [
                        <IdentityBadge entity={type.toUpperCase()} />,
                        pair,
                        price,
                        strike,
                        expiration.toString(),
                        premium,
                        lp,
                        share,
                        bop, wop,
                        status,
                        feature,
                        <ContextMenu>
                            {ACTION_DROPDOWN_OPTIONS.map(option => (
                                <ContextMenuItem key={option}>{option}</ContextMenuItem>
                            ))}
                        </ContextMenu>
                    ]
                }}
            />
        </div>
    )
}
