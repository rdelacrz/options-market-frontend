import React, { FunctionComponent } from 'react';
import { DataView } from '@aragon/ui';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { State, updateFlaggedFunds } from '@reduxConfig';
import { AmmData, OptionsEntry } from '@models';
import { getGreeks, useWindowSize } from '@utilities';

import './styles.scss';

const DETAILS_FIELDS = ['Key', 'Value'];

interface DetailsTableViewProps {
    className?: string;
    optionEntry: OptionsEntry;
}

export const DetailsTableView: FunctionComponent<DetailsTableViewProps> = (props) => {
    /* Redux variables */
    const ammData = useSelector<State, { [id: string]: AmmData}>(state => state.fundInfo.ammDataMap) || {};
    const ammDataEntry = ammData[props.optionEntry.id];

    const { width } = useWindowSize();
    const mode = width > 900 ? 'table' : 'list';

    // Gets greeks from given options entry and AMM data
    let greeks: { delta: number, gamma: number, vega: number, theta: number, rho: number };
    if (ammDataEntry) {
        greeks = getGreeks(props.optionEntry, ammDataEntry);
    }

    const optionDetails = [
        {key: 'Open Interest', value: props.optionEntry.openInterest},
        {key: 'Break Even', value: props.optionEntry.breakEven},
        {key: 'Delta', value: greeks?.delta},
        {key: 'Gamma', value: greeks?.gamma},
        {key: 'Theta', value: greeks?.theta},
        {key: 'Vega', value: greeks?.vega},
        {key: 'Rho', value: greeks?.rho},
        {key: 'TVL', value: props.optionEntry.tvl},
        {key: 'APY', value: props.optionEntry.apy},
    ]

    return (
        <div className={classnames('details-table-view-wrapper', {[props.className]: !!props.className})}>
            <DataView
                mode={mode}
                fields={DETAILS_FIELDS}
                entries={optionDetails}
                renderEntry={(detail: {key: string, value: string}, index: number) => {
                    return [
                        detail.key,
                        detail.value,
                    ]
                }}
            />
        </div>
    )
}
