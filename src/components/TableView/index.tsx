import React, { FunctionComponent, useRef, useState } from 'react';
import { TokenAmount, DataView, IdentityBadge } from '@aragon/ui';
import classnames from 'classnames';
import { useWindowSize } from '@utilities';

import './styles.scss';

interface TableViewProps {
    className?: string;
}

export const TableView: FunctionComponent<TableViewProps> = () => {
    const { width } = useWindowSize();
    const mode = width > 900 ? 'table' : 'list';
    return (
        <div>
            <DataView
                mode={mode}
                fields={['Type', 'Pair', 'Price', 'STRIKE', 'Expiration', 'Premium', 'LP', 'Share%', 'BOP', 'WOP', 'Status', 'Feature (blank)', 'Dropdown (blank)']}
                entries={[
                    { type: 'CALL', pair: 'WBTC-USDC', price: 60000, strike: 80000, expiration: '26/03/2021', premium: 0.0592, lp: null, share: 0, bop: null, wop: null, status: 'Open', feature: null, dropdown: null },
                ]}
                renderEntry={({ type, pair, price, strike, expiration, premium, lp, share, bop, wop, status, feature, dropdown }) => {
                    return [<IdentityBadge entity={type} />, pair, price, strike, expiration, premium, lp, share, bop, wop, status, feature, dropdown]
                }}
            />
        </div>
    )
}