/**
 * Contains general-purpose React hooks that can be utilized by components.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import { throttle } from 'lodash';
import { useSelector } from 'react-redux';
import { AmmData, Market, OptionsEntry } from '@models';
import { State } from '@reduxConfig';
import { getFundDataFromMarketData, getGreeks } from './dataCalculators';

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
        const updatedFundList = baseFundList.map(optionsEntry => {
            const ammData = ammDataMap[optionsEntry.id];
            if (ammData) {
                optionsEntry.paymentPerCollateral = ammData.exchange;
                optionsEntry.premium = ammData.premium;
    
                // Sets price of call/put option based on the collateral
                const exchangeRate = optionsEntry.type === 'call'
                    ? new BigNumber(optionsEntry.paymentPerCollateral)
                        .decimalPlaces(2)
                        .toNumber()
                    : new BigNumber(1 / optionsEntry.paymentPerCollateral)
                        .decimalPlaces(2)
                        .toNumber();
                optionsEntry.price = exchangeRate;
    
                // Calculates break even point using premium, exchange rate, and strike point
                optionsEntry.breakEven = optionsEntry.type === 'call'
                    ? utils.commify(
                        new BigNumber(optionsEntry.premium * exchangeRate + optionsEntry.strike)
                            .decimalPlaces(2)
                            .toString(),
                    )
                    : utils.commify(
                        new BigNumber(optionsEntry.strike)
                            .minus(optionsEntry.premium * exchangeRate)
                            .decimalPlaces(2)
                            .toString(),
                    )
                
                // Gets greeks for given options entry
                optionsEntry = { ...optionsEntry, ...getGreeks(optionsEntry, ammData) };
            }
            return optionsEntry;
        });
        setFundList(updatedFundList);
    }, 1000));

    useEffect(() => {
        throttleUpdate.current(baseFundList, ammDataMap);
    }, [baseFundList, ammDataMap]);

    return fundList.length > 0 ? fundList : baseFundList;
}