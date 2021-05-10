import React, { FunctionComponent, useCallback } from 'react';
import { ContextMenu, ContextMenuItem, DataView, IconStar, IconStarFilled } from '@aragon/ui';
import classnames from 'classnames';
import { push } from 'connected-react-router';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { OptionsEntry } from '@models';
import { State, updateFlaggedFunds } from '@reduxConfig';
import { useWindowSize } from '@utilities';

import './styles.scss';

const OPTIONS_FIELDS = [
    'Type', 'Pair', 'Price', 'STRIKE', 'Expiration', 'Premium', 'LP', 'Share%',
    'BOP', 'WOP', 'Status'
];

interface OptionsTableViewProps {
    className?: string;
    entries: OptionsEntry[];
    loading?: boolean;
    detailMode?: boolean;
}

export const OptionsTableView: FunctionComponent<OptionsTableViewProps> = (props) => {
    const flaggedFunds = useSelector<State, { [id: string]: boolean }>(state => state.fundInfo.flaggedFunds) || {};
    const dispatch = useDispatch();

    const { width } = useWindowSize();
    const mode = width > 900 ? 'table' : 'list';

    /**
     * Flags a fund and updates star state accordingly based on the given id and updated state value.
     * 
     * @param fundId Fund id associated with star clicked.
     * @param updatedState True if fund is flagged, false otherwise (determines state of displayed star).
     */
    const handleStarClick = useCallback((fundId: string, updatedState: boolean) => {
        dispatch(updateFlaggedFunds({...flaggedFunds, [fundId]: updatedState}));
    }, [flaggedFunds]);

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
                    return [
                        <div className={classnames('option-type', optionsEntry.type)}>
                            {optionsEntry.type.toUpperCase()}
                        </div>,
                        <Link className='options-pair-link' to={`/funds/${index}`}>
                            {optionsEntry.pair}
                        </Link>,
                        optionsEntry.price,
                        <div className='strike-price'>${optionsEntry.strike}</div>,
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
                        
                    ]
                }}
                renderEntryActions={(optionsEntry: OptionsEntry, index: number) => {
                    const entryFlagged = !!flaggedFunds[optionsEntry.id];
                    return (
                        <div className='entry-actions-wrapper'>
                            {entryFlagged ?
                                <IconStarFilled className='entry-flag' onClick={() => handleStarClick(optionsEntry.id, !entryFlagged)} /> :
                                <IconStar className='entry-flag' onClick={() => handleStarClick(optionsEntry.id, !entryFlagged)} />}
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
                        </div>
                    );
                }}
            />
        </div>
    )
}
