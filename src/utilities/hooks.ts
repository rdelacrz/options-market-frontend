/**
 * Contains general-purpose React hooks that can be utilized by components.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { throttle } from 'lodash';
import { useSelector } from 'react-redux';
import { AmmData, Market, OptionsEntry } from '@models';
import { State } from '@reduxConfig';
import { getAdditionalFundDataFromAMMData, getFundDataFromMarketData } from './dataCalculators';

export const useWindowSize = () => {
    const [size, setSize] = useState([0, 0]);
    if (typeof window !== 'undefined') {
        useLayoutEffect(() => {
            function updateSize() {
                setSize([window.innerWidth, window.innerHeight]);
            }
            window.addEventListener('resize', updateSize);
            updateSize();
            return () => window.removeEventListener('resize', updateSize);
        }, []);
    }
    return {width: size[0], height: size[1]};
}

/**
 * Gets the initial fund list `baseFundList` produced by parsing the markets data, as well as the final `fundList` parameters
 * created by processing AMM data.
 * 
 * Note that the `fundList` parameter is continously being updated (throttled to enhance performance), meaning that DataView
 * components directly tied to it would be continously re-rendered and brought back to page one. This is why it is important
 * to use `baseFundList` instead for the `entries` prop in DataView, since baseFundList only re-renders when the markets themselves
 * are updated.
 * 
 * @returns Data dictionary with references for the `baseFundList` and `fundList`.
 */
export const useFundList = () => {
    const markets = useSelector<State, Market[]>(state => state.fundInfo.markets);
    const ammDataMap = useSelector<State, { [id: string]: AmmData }>(state => state.fundInfo.ammDataMap);
    
    const baseFundList = useMemo(() => (
        markets.map(market => getFundDataFromMarketData(market))
            .filter(fund => fund.status === 'open')
    ), [markets]);

    // Updated separately from base fund list
    const [fundList, setFundList] = useState<OptionsEntry[]>([]);
    
    // Throttle as AMM data is updated many times via parallel API calls and would otherwise result in redundant calculations
    const throttleUpdate = useRef(throttle((baseFundList: OptionsEntry[], ammDataMap: { [id: string]: AmmData }) => {
        const updatedFundList = baseFundList.map(optionsEntry => getAdditionalFundDataFromAMMData(optionsEntry, ammDataMap));
        setFundList(updatedFundList);
    }, 1000));

    useEffect(() => {
        throttleUpdate.current(baseFundList, ammDataMap);
    }, [baseFundList, ammDataMap]);

    return { baseFundList, fundList };
}