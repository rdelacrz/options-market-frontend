import React, { FunctionComponent } from 'react';
import { DataView } from '@aragon/ui';
import classnames from 'classnames';
import { OptionsEntry } from '@models';
import { useWindowSize } from '@utilities';

import './styles.scss';

const DETAILS_FIELDS = ['Key', 'Value'];

interface DetailsTableViewProps {
    className?: string;
    optionEntry: OptionsEntry;
}

export const DetailsTableView: FunctionComponent<DetailsTableViewProps> = (props) => {
    const { width } = useWindowSize();
    const mode = width > 900 ? 'table' : 'list';

    const optionDetails = [
        {key: 'Open Interest', value: props.optionEntry.openInterest},
        {key: 'Break Even', value: props.optionEntry.breakEven},
        {key: 'Delta', value: props.optionEntry.delta},
        {key: 'Gamma', value: props.optionEntry.gamma},
        {key: 'Theta', value: props.optionEntry.theta},
        {key: 'Vega', value: props.optionEntry.vega},
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
